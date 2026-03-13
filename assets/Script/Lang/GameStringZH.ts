const zh = {} as any;
const math = zh.math = {} as any;
math.k = '千'
math.w = '万'
math.bw = '百万'
math.y = '亿'
math.z = '兆'

// 通用
const common = zh.common = {} as any;
common.closeTip = "点击空白处关闭";
common.continueTip = "点击空白处继续";
common.unlockModule = "解锁新系统功能";
common.cancel = "取消";
common.btnCancel = "容我三思";
common.confirm = "确认";
common.tip = "提示";
common.level = "境界";
common.helpTitle = "修真心得";
common.useCount = "使用数量：${cur}/${max}";
common.change = "更改";
common.notenoughprop = "道具不足";
common.property = "<color=#5F6168>${name}：</color><color=#2E3235>+${value}</color>";
common.property2 = "${name}<color=#6DE3AA>+${value}</color>";
common.property3 = "${name}：<color=#B6DDA5>+${value}</color>";
common.propertyAdd = "${name}：<color=#2E3235>+${value}</color>(<color=#00843E>+${add}</color>)";
common.propertyAdd2 = "<color=#5F6168>${name}：</color><color=#2E3235>+${value}</color>(<color=#00843E>+${add}</color>)";
common.star = "星级";
common.state1 = "未完成"
common.state2 = "可激活"
common.state3 = "已激活"
common.back = "返回";
common.quality1 = "<color=#BBBBBB>凡级</color>";	//灰
common.quality2 = "<color=#6DE3AA>黄级</color>";	//绿
common.quality3 = "<color=#6DC9E3>玄级</color>";	//蓝
common.quality4 = "<color=#C06DE3>地级</color>";	//紫
common.quality5 = "<color=#E3B86D>天级</color>";	//橙
common.quality6 = "<color=#E36D6D>仙级</color>";	//红
common.quality_1 = "凡级";
common.quality_2 = "黄级";
common.quality_3 = "玄级";
common.quality_4 = "地级";
common.quality_5 = "天级";
common.quality_6 = "仙级";
common.unlock = "敬请期待";
common.countZeroErr = "使用数量不能是0";
common.sellTips = "${name}X${count}";
common.rewardTips = "获得${name}X${count}";
common.combine = "合成";
common.combineTitle = "选择合成数量";
common.haveCount = "拥有数量：";
common.combineCount = "合成数量：";
common.somethingNotEnough = "${name}不足";
common.or = "或"
common.empty = "（无）";
common.empty2 = "无";
common.nothing = "空空如也";
common.desc = "描述";
common.timeFormat1 = "${dd}天${hh}小时${mm}分钟";
common.use = "使用";
common.sell = "出售";
common.used = "已使用";
common.refreshTip = "数据刷新中，稍后重试！";
common.dataErr = "数据错误！";
common.select = "选择";
common.selectMultiple = "选择道具";
common.selectMultipleDesc = "选择${count}件想要获得的道具";
common.price = "${price}元";
common.priceBuy = "${price}元购买";
common.attrUp = "属性提升";
common.noName = "道友无名";
common.coming2 = "功能暂未开启！";
common.obtain = "获取途径";
common.noData = "未获取";
common.comingSoon = "敬请期待！";
common.version = "当前资源版本：${version}";
common.summary = "属性总览";
common.exit = "退出";
common.Receive = "领取";
common.Goto = "前往";
common.video = "观影";
common.dayTip = "今日不再弹出";
common.noQuick = "当前已完成，无需加速";
common.download = "下载";
common.downloadProgress = "下载进度";
common.downloadReward = "下载完成可以领取以下奖励";
common.discount = "${discount}折";

//逗号
common.comma = "，";
common.semicolon = "；";
common.max = "已圆满";
common.realName = "${realm}期";
common.colon = "：";
common.level = "级";
common.second = "秒";
common.today = "今天";
common.tomorrow = "明天";
common.afterTomorrow = "后天";
common.afterDays = "${day}天后";
common.flowTips = "<outline color=#2E2718 width=2>${tips}</outline>";
common.gotIt = "我已知晓";
common.gettingData = "数据尚未获取！";
common.gainNone = "猜测失误,一无所获~";
common.level1 = "${level}品";
common.level2 = "仙${level}";
common.gainPrefix = "可获得：";
common.usePropTip = "当前<color=#A02F2C>${name}不足</c>，是否使用纳戒中的<color=#00843E>${name}</c>？";
common.useNum = "${cur}/${max}";
common.loadingBundle = "资源下载中，稍后再试！";
common.selectNotEnough = "请选择${count}件道具";

// hotUpdate
const hotUpdate = zh.hotUpdate = {} as any;
hotUpdate.waitForUpdate = "检测更新中...";
hotUpdate.doUpdate = "下载资源中...";
hotUpdate.errLocalFile = "本地文件异常...";
hotUpdate.errUpdate = "更新出错, 错误码:${error}";
hotUpdate.failUpdate = "更新失败了";
hotUpdate.exit = "退出";
hotUpdate.restart = "重启";
hotUpdate.retry = "重试";
hotUpdate.update = "更新";
hotUpdate.updateTips = "有可更新版本，是否下载大小为${size}的更新资源？\n${version}>${removeVersion}";
hotUpdate.upodateFinish = "更新完成，即将重启游戏";
hotUpdate.finish = "更新完成";
hotUpdate.downloading = "更新文件：${curFile}/${totalFile}\n大小：${curSize}/${totalSize}";
hotUpdate.errRemoteFile = "下载远端文件异常.";
hotUpdate.forceUpdateTips = "有可更新版本，是否跳转下载？\n${version}>${removeVersion}";

// login
const login = zh.login = {} as any;
login.notice = "公告";
login.fix = "清理";
login.age = "适龄提示";
login.serverNew = "新服"
login.serverHot = "火爆"
login.serverFull = "已满"
login.serverMaintain = "维护"
login.autoLogin = "即将自动登录账号："
login.autoLoginTip = "自动登录倒计时${left}s";
login.switchServer = "更换位面";
login.origin1 = "剑修";
login.origin2 = "拳修";
login.origin3 = "法修";
login.connectErr = "与服务器断开连接";
login.getNoticeErr = "获取公告失败！";
login.getServerErr = "获取服务器列表失败！";
login.noServerList = "服务器列表为空！";
login.noticeIsEmpty = "暂无公告！";
login.everyone = "各位仙友：";
login.title10010 = "服务器连接已断开";
login.title10011 = "账号重复登录";
login.title10012 = "服务器维护提醒";
login.title10013 = "账号已封禁";
login.tip10010 = "当前网络连接不稳定，请检查您的网络设置后重试。\n如果问题持续，请联系客服寻求帮助。";
login.tip10011 = "您的游戏账号已在另一台设备上登录，当前连接已断开。\n如非您本人操作，请注意账号安全。请重新登录。";
login.tip10012 = "服务器已进入维护状态，游戏服务暂时不可用。\n对于中断您的游戏体验，我们感到非常抱歉。\n维护结束后请查收游戏内邮件补偿。详情请见官方公告。";
login.tip10013 = "检测到您的账号存在违规行为，现已被封禁。\n如有疑问，请联系客服进行申诉。";
login.serverName = "${name}";
login.waitingServer = "等待服务器数据返回。";
login.lastLogin = "上次登录";
login.noSeverList = "未能正确获取服务器列表，请稍后再试..."
login.fixTip = "确认删除缓存并重启游戏？";

export { zh };