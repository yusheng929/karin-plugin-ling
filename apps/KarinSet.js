import { plugin, Cfg } from 'node-karin'
import lodash from 'lodash'
import { Config } from '#lib'
import { Render } from '#components'
import moment from 'moment'
const cfgMap = {
	'黑名单': 'App_BlackList.users',
	'黑名单群': 'App_BlackList.groups',
	'白名单': 'App_WhiteList.users',
	'白名单群': 'App_White.groups',
};

const CfgReg = `^#?Karin设置\\s*(${lodash.keys(cfgMap).join('|')})?\\s*(.*)$`;

export class setting extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'Karin设置',
			/** 功能描述 */
			dsc: '',
			/** https://oicqjs.github.io/oicq/#events */
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: -10,
			rule: [
				{
					/** 命令正则匹配 */
					reg: CfgReg,
					/** 执行方法 */
					fnc: 'message',
					permission: 'master'
				}
			]
		});
	}

	async message() {
		return await set(this.e);
	}
}


async function set(e) {
	let reg = new RegExp(CfgReg).exec(e.msg);

	if (reg && reg[2]) {
		let val = reg[3] || ''
		let cfgKey = cfgMap[reg[2]]
		if (val.includes('开启') || val.includes('关闭')) {
			val = !/关闭/.test(val);
		} else {
			cfgKey = '';
		}

		if (cfgKey) {
			setCfg(cfgKey, val);
		}
	}


	let cfg = {};
	for (let name in cfgMap) {
		let key = cfgMap[name].split('_')[1];
		cfg[key] = getStatus(cfgMap[name]);
	}

	// 渲染图像
	return await Render.render('admin/index', {
		...cfg
	}, { e, scale: 1 });

}

function setCfg(rote, value, def = false) {
	let arr = rote?.split('_') || [];
	if (arr.length > 0) {
		let type = arr[0], name = arr[1];
		let data = Cfg.getYaml(def ? 'defSet' : 'config', type) || {}
		data[name] = value;
		Config.save(type, def ? 'defSet' : 'config', data);
	}
}

const getStatus = function (rote, def = false) {
	let _class = 'cfg-status';
	let value = '';
	let arr = rote?.split('_') || [];
	if (arr.length > 0) {
		let type = arr[0], name = arr[1];
		let data = Cfg.getYaml(def ? 'defSet' : 'config', type) || {};
		if (data[name] == true || data[name] == false) {
			_class = data[name] == false ? `${_class}  status-off` : _class;
			value = data[name] == true ? '已开启' : '已关闭';
		} else {
			value = data[name];
		}
	}
	if (!value) {
			_class = `${_class}  status-off`;
			value = '已关闭';
	}

	return `<div class="${_class}">${value}</div>`;
}