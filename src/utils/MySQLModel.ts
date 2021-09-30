import * as mysql from 'mysql'

class MySQLModel {
	static db: mysql.Connection
	table
	primaryKey

	static connect(params: mysql.ConnectionConfig): Promise<void> {
		if (this.db) return Promise.resolve()
		return new Promise((resolve) => {
			this.db = mysql.createConnection(params)
			this.db.connect((err: mysql.MysqlError) => {
				if (err) {
					console.error(err)
					resolve()
				} else {
					this.db.query('SET NAMES "utf8mb4"', () => this.db.query('SET @@SESSION.time_zone = "+00:00"', async () => resolve()))
				}
			})
		})
	}

	static raw(sql: string, params?: Array<any>, cb?: (err: Error | null, res: any | null) => void): void {
		this.db.query(sql, params, (err: mysql.MysqlError | null, res?: any) => {
			if (err) {
				if (cb) cb(err, null)
			} else {
				let result = null
				if (res) {
					if (Array.isArray(res)) {
						result = res.length ? res : null
					} else if (res.affectedRows == 1 && res.insertId) {
						result = res.insertId
					} else if (res.affectedRows) {
						result = res.affectedRows
					}
				}
				if (cb) cb(null, result)
			}
		})
	}
	static async exec(sql: string, params?: Array<any>): Promise<any> {
		return new Promise((resolve) => {
			this.raw(sql, params, (err, res) => {
				if (err) {
					console.log(err)
					resolve(null)
				} else {
					resolve(res)
				}
			})
		})
	}
	constructor(table: string, primaryKey = 'id') {
		this.table = table
		this.primaryKey = primaryKey
	}

	getFields(fields: Array<string>, noDefault = false): string | null {
		if (fields) return fields.map((v) => this.sanitize(v, 2)).join(',')
		return noDefault ? null : '*'
	}

	getWhere(query: any): string {
		let where = ''
		for (const k in query) {
			const field = this.sanitize(k, 2)
			if (where) where += ' AND '
			if (k == '$or') {
				const kv = query[k]
				if (Array.isArray(kv)) {
					where += '(' + kv.map((k) => this.getWhere(k)).join(' OR ') + ')'
				} else {
					new Error('[$or] Expected array but found ' + typeof kv)
				}
			} else if (k == '$and') {
				const kv = query[k]
				if (Array.isArray(kv)) {
					where += '(' + kv.map((k) => this.getWhere(k)).join(' AND ') + ')'
				} else {
					new Error('[$or] Expected array but found ' + typeof kv)
				}
			} else if (query[k] && Array.isArray(query[k])) {
				where += field + ' IN (' + query[k].map((v: any) => '"' + v + '"').join(',') + ')'
			} else if (typeof query[k] === 'object') {
				for (const k2 in query[k]) {
					let value
					if (query[k][k2] !== null) {
						if (!Array.isArray(query[k][k2])) {
							if (k2 === '$lk') {
								value = "'%" + this.sanitize(query[k][k2], 0) + "%'"
							} else {
								value = this.sanitize(query[k][k2], 1)
							}
						}
					}
					switch (k2) {
					case '$ne':
						if (query[k][k2] == null) {
							where += 'NOT ISNULL(' + field + ')'
						} else {
							where += field + ' <> ' + value
						}
						break
					case '$gt':
						where += field + '>' + value
						break
					case '$lt':
						where += field + '<' + value
						break
					case '$bt':
						{
							const a = Number(query[k][k2][0])
							const b = Number(query[k][k2][1])
							if (a && b) {
								where += field + " BETWEEN '" + a + "' AND '" + b + "'"
							} else {
								new Error('$bt arg error')
							}
						}
						break
					case '$in':
							/* let vals = ''
							query[k][k2].map((v: any) => {
								if (vals) vals += ','
								vals += '"' + v + '"'
							}) */
						where += field + ' IN (' + query[k][k2].map((v:string|number)=>'"'+v+'"').join(',') + ')'
						break
					case '$lk':
						where += field + ' LIKE ' + value
						break
					case '$rg':
						where += field + ' REGEXP ' + value
						break
					}
				}
			} else {
				if (query[k] == null) {
					where += 'ISNULL(' + field + ')'
				} else {
					const value = this.sanitize(query[k], 1)
					where += field + '=' + value
				}
			}
		}
		return where
	}
	getOrder(order: any): string {
		let orderBy = ''
		if (order) {
			if (order === 'rand') return 'RAND()'
			for (const k in order) {
				if (orderBy) orderBy += ','
				orderBy += this.sanitize(k, 2) + (order[k] == 1 ? '' : ' DESC')
			}
		}
		return orderBy
	}
	find(query: any = null, order: any = null, fields: any = null, paging: any = null ): Promise<Array<any> | null> {
		return new Promise((resolve) => {
			const where = query && this.getWhere(query)
			const orderBy = order && this.getOrder(order)
			if (!fields) fields = '*'
			if (paging) {
				const limit = paging.limit || 20
				const offset = paging.offset || 0
				MySQLModel.raw('SELECT ' + fields + ' FROM `' + this.table + '`' + (where ? ' WHERE ' + where : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ' LIMIT ' + offset + ',' + limit, [], (err, res) => {
					if (res) {
						resolve(res)
					} else {
						console.error(err)
						resolve(null)
					}
				})
			} else {
				MySQLModel.raw('SELECT ' + fields + ' FROM `' + this.table + '`' + (where ? ' WHERE ' + where : '') + (orderBy ? ' ORDER BY ' + orderBy : ''), [], (err, res) => {
					if (res) {
						resolve(res)
					} else {
						console.log(err)
						resolve(null)
					}
				})
			}
		})
	}

	findOne(query: any, order?: any, fields?: string | Array<string> ): Promise<any | null> {
		return new Promise((resolve) => {
			let where
			if (typeof query === 'string' || typeof query === 'number') {
				where = '`' + this.primaryKey + "`='" + query + "'"
			} else {
				where = this.getWhere(query)
			}
			const orderBy = this.getOrder(order)
			if (!fields) fields = '*'
			MySQLModel.raw('SELECT ' + fields + ' FROM `' + this.table + '`' + (where ? ' WHERE ' + where : '') + (orderBy ? ' ORDER BY ' + orderBy : '') + ' LIMIT 1', [], (err, res) => {
				if (res && Array.isArray(res)) {
					resolve(res[0])
				} else {
					console.log(err)
					resolve(null)
				}
			})
		})
	}

	update(query: any, data: any): Promise<any | null> {
		return new Promise((resolve) => {
			let where
			if (typeof query === 'string' || typeof query === 'number') {
				where = '`' + this.primaryKey + "`='" + query + "'"
			} else {
				where = this.getWhere(query)
			}
			let fields = ''
			const values = []
			for (const k in data) {
				if (fields) fields += ','
				const field = this.sanitize(k, 2)
				if (data[k] && typeof data[k] === 'object' && data[k].constructor === Object) {
					for (const k2 in data[k]) {
						switch (k2) {
						case '$ad':
							fields += field + '=' + field + '+?'
							break
						case '$sb':
							fields += field + '=' + field + '-?'
							break
						case '$ml':
							fields += field + '=' + field + '*?'
							break
						case '$dv':
							fields += field + '=' + field + '/?'
							break
						}
						values.push(data[k][k2])
					}
				} else {
					if (data[k] === null) {
						fields += field + '=NULL'
					} else {
						fields += field + '=?'
						values.push(data[k])
					}
				}
			}
			MySQLModel.raw('UPDATE `' + this.table + '` SET ' + fields + (where ? ' WHERE ' + where : ''), values, (err, res) => {
				if (res) {
					resolve(res)
				} else {
					console.error(err)
					resolve(null)
				}
			})
		})
	}
	deleteAll(): Promise<any | null> {
		return new Promise((resolve) => {
			MySQLModel.raw('DELETE FROM `' + this.table + '`', [], (err, res) => {
				if (res) {
					resolve(res)
				} else {
					console.log(err)
					resolve(null)
				}
			})
		})
	}
	delete(query: any): Promise<any | null> {
		return new Promise((resolve) => {
			let where
			if (typeof query === 'string' || typeof query === 'number') {
				where = '`' + this.primaryKey + "`='" + query + "'"
			} else {
				where = this.getWhere(query)
			}
			MySQLModel.raw('DELETE FROM `' + this.table + '` ' + (where ? ' WHERE ' + where : ''), [], (err, res) => {
				if (res) {
					resolve(res)
				} else {
					console.log(err)
					resolve(null)
				}
			})
		})
	}

	insert(data: any, ignoreDup = true): Promise<any | null> {
		return new Promise((resolve) => {
			const params: any = []
			let fields = '', values = '', line = ''
			data = Array.isArray(data) ? data : [data]
			data.map((v: any, i: any) => {
				line = ''
				for (const k in v) {
					if (i == 0) {
						if (fields) fields += ','
						fields += this.sanitize(k, 2)
					}
					if (line) line += ','
					line += '?'
					params.push(v[k])
				}
				if (values) values += ','
				values += '(' + line + ')'
			})
			MySQLModel.raw('INSERT ' + (ignoreDup ? 'IGNORE' : '') + ' INTO `' + this.table + '`(' + fields + ') VALUES ' + values, params, (err, res) => {
				if (res) {
					resolve(res)
				} else {
					console.error(err)
					resolve(null)
				}
			})
		})
	}
	insertOrUpdate(data: any): Promise<any | null> {
		return new Promise((resolve) => {
			const params: any = []
			let fields = '', values = '', line = '', updates = ''
			data = Array.isArray(data) ? data : [data]
			data.map((v: any, i: any) => {
				line = ''
				for (const k in v) {
					if (i == 0) {
						if (fields) fields += ','
						const field = this.sanitize(k, 2)
						fields += field
						if (k != this.primaryKey) {
							if (updates) updates += ','
							updates += field + '=VALUES(' + field + ')'
						}
					}
					if (line) line += ','
					line += '?'
					params.push(v[k])
				}
				if (values) values += ','
				values += '(' + line + ')'
			})
			MySQLModel.raw('INSERT INTO `' + this.table + '`(' + fields + ') VALUES ' + values + ' ON DUPLICATE KEY UPDATE ' + updates, params, (err, res) => {
				if (res !== null) {
					resolve(res)
				} else {
					console.log(err)
					resolve(null)
				}
			})
		})
	}
	max(field: string, query: any = null): Promise<number> {
		return new Promise((resolve) => {
			const where = query ? this.getWhere(query) : null
			MySQLModel.raw('SELECT MAX(`' + field + '`) m FROM `' + this.table + '`' + (where ? ' WHERE ' + where : ''), [], (err, res) => {
				if (res && Array.isArray(res)) {
					resolve(res[0].m || 0)
				} else {
					console.log(err)
					resolve(0)
				}
			})
		})
	}
	min(field: string, query: any = null): Promise<number> {
		return new Promise((resolve) => {
			const where = query ? this.getWhere(query) : null
			MySQLModel.raw('SELECT min(`' + field + '`) m FROM `' + this.table + '`' + (where ? ' WHERE ' + where : ''), [], (err, res) => {
				if (res && Array.isArray(res)) {
					resolve(res[0].m || 0)
				} else {
					console.log(err)
					resolve(0)
				}
			})
		})
	}
	sum(field: string, query: any = null): Promise<number> {
		return new Promise((resolve) => {
			const where = query ? this.getWhere(query) : null
			MySQLModel.raw('SELECT sum(`' + field + '`) m FROM `' + this.table + '`' + (where ? ' WHERE ' + where : ''), [], (err, res) => {
				if (res && Array.isArray(res)) {
					resolve(res[0].m || 0)
				} else {
					console.log(err)
					resolve(0)
				}
			})
		})
	}
	count(field: string, query: any = null): Promise<number> {
		return new Promise((resolve) => {
			if (query === null) {
				if (field !== null) query = field
				field = '*'
			}
			const where = query ? this.getWhere(query) : null
			MySQLModel.raw('SELECT count(' + field + ') m FROM `' + this.table + '`' + (where ? ' WHERE ' + where : ''), [], (err, res) => {
				if (res && Array.isArray(res)) {
					resolve(res[0].m || 0)
				} else {
					console.log(err)
					resolve(0)
				}
			})
		})
	}
	sanitize(v: any, type = 0): string {
		if (v === null) return 'NULL'
		if (typeof v == 'string') v = v.replace(/'/g, '').replace(/\\/g, '')
		switch (type) {
		case 1: // value
			if (typeof v === 'string' && v.indexOf('`') == -1 && v.indexOf('(') == -1) return `'${v}'`
			break
		case 2: // field
			if (v.indexOf('`') == -1 && v.indexOf('(') == -1) return '`' + v + '`'
			break
		}
		return v
	}
}

export default MySQLModel
