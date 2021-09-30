import * as React from 'react'
import { useState } from 'react'
import { Button, Select, Tag } from 'antd'
import classNames from 'classnames'
import filter from 'lodash/filter'
import map from 'lodash/map'
import indexOf from 'lodash/indexOf'
import isEmpty from 'lodash/isEmpty'
import styles from './Filter.module.scss'

interface FilterProps {
  onChange?: (value: any) => void
}

const Filter: React.FC<FilterProps> = ({ onChange }) => {
  const [select, setSelect] = useState('Filter')
  const [options, setOptions] = useState<Array<string>>([])

  const handleClearOption = (key: string) => {
    setOptions(filter(options, (option) => option !== key))
  }

  const handleClearAll = () => {
    setOptions([])
  }

  const handleSelectOption = (value?: string) => {
    if (!value) {
      return
    }
    if (indexOf(options, value) > -1) {
      return
    }

    setOptions([...options, value])
    setSelect('Filter')

    if (onChange) {
      onChange(options)
    }
  }

  return (
    <div className={styles.filter}>
      <Select
        className={classNames(styles.select, styles.input)}
        placeholder="Filter"
        value={select}
        onSelect={handleSelectOption}
      >
        <Select.Option value="Sales">Sales</Select.Option>
        <Select.Option value="Transfers">Transfers</Select.Option>
        <Select.Option value="Created">Created</Select.Option>
      </Select>
      {map(options, (option) => (
        <Tag
          closable
          className={classNames(styles.tag, styles.input)}
          key={option}
          onClose={() => handleClearOption(option)}
        >
          {option}
        </Tag>
      ))}
      {!isEmpty(options) && (
        <Button className={styles.clear} type="link" onClick={handleClearAll}>
          Clear All
        </Button>
      )}
    </div>
  )
}

export default Filter
