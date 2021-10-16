
import type { NextApiRequest, NextApiResponse } from 'next'
import { getGeetestByPass } from '@/utils/datamodel';
const GeetestLib = require('@/geetestsdk/geetest_lib');

export default async (req: NextApiRequest, res: NextApiResponse<any>) => {
	const gtLib = new GeetestLib(process.env.GEETEST_ID, process.env.GEETEST_KEY);
    const challenge = req.body[GeetestLib.GEETEST_CHALLENGE];
    const validate = req.body[GeetestLib.GEETEST_VALIDATE];
    const seccode = req.body[GeetestLib.GEETEST_SECCODE];
	const bypass = await getGeetestByPass();
    let result;
    var params = new Array();
    if (bypass){
        result = await gtLib.successValidate(challenge, validate, seccode, params);
    } else {
        result = gtLib.failValidate(challenge, validate, seccode);
    }
    // 注意，不要更改返回的结构和值类型
    if (result.status === 1) {
        return res.json({"result":"success", "version": GeetestLib.VERSION});
    } else {
        return res.json({"result": "fail", "version": GeetestLib.VERSION, "msg": result.msg});
    }
}
