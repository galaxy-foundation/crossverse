import { getGeetestByPass } from '@/utils/datamodel';
import type { NextApiRequest, NextApiResponse } from 'next'
const GeetestLib = require('@/geetestsdk/geetest_lib');

export default async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
	/*
    必传参数
        digestmod 此版本sdk可支持md5、sha256、hmac-sha256，md5之外的算法需特殊配置的账号，联系极验客服
    自定义参数,可选择添加
        user_id 客户端用户的唯一标识，确定用户的唯一性；作用于提供进阶数据分析服务，可在register和validate接口传入，不传入也不影响验证服务的使用；若担心用户信息风险，可作预处理(如哈希处理)再提供到极验
        client_type 客户端类型，web：电脑上的浏览器；h5：手机上的浏览器，包括移动应用内完全内置的web_view；native：通过原生sdk植入app应用的方式；unknown：未知
        ip_address 客户端请求sdk服务器的ip地址
     */
	console.log(req);
	const gtLib = new GeetestLib(process.env.GEETEST_ID, process.env.GEETEST_KEY);
	const digestmod = "md5";
	const userId = "test";
	const params = {"digestmod": digestmod, "user_id": userId, "client_type": "web", "ip_address": "127.0.0.1"}
	const bypass = await getGeetestByPass();
	let result;
	if (bypass){
		result = await gtLib.register(digestmod, params);
	}else{
		result = await gtLib.localRegister();
	}
	res.setHeader('Content-Type', 'application/json;charset=UTF-8')
	return res.send(result.data);
}
