import type { RemakeId } from "../life/remake-engine";

export type WeirdTaleSource = {
  type: "event" | "talent";
  id: RemakeId;
};

export type WeirdTaleClue = {
  id: string;
  order: number;
  title: string;
  hint: string;
  body: string;
  sources: readonly WeirdTaleSource[];
  minimumPriorClues?: number;
};

export type WeirdTaleLine = {
  id: string;
  title: string;
  partialTitle: string;
  revealAfter: number;
  eyebrow: string;
  introduction: string;
  recurringMotifs: readonly string[];
  ending: string;
  clues: readonly WeirdTaleClue[];
};

export const WEIRD_TALE_LINES: readonly WeirdTaleLine[] = [
  {
    id: "white-stone-pass",
    title: "白石坳借年簿",
    partialTitle: "山中旧录",
    revealAfter: 4,
    eyebrow: "一条尚未证实的山中旧闻",
    introduction: "这些记录来自互不相干的人生。有人坚持它们只是巧合，也有人注意到，某些地名、气味与字句反复出现在本不该相遇的年份里。以下内容没有得到证实。",
    recurringMotifs: ["无舌铜铃", "草木灰", "白石坳", "借一岁，过一岭"],
    ending: "所有残页都对上了。只是“外人已归”究竟指谁，记录里没有答案。",
    clues: [
      {
        id: "split-tree",
        order: 1,
        title: "雷劈旧树",
        hint: "年轮里有一件不该长进去的东西。",
        body: "雷雨后，门前老槐被劈成两半。断面有七圈颜色发黑的年轮，最里层嵌着一枚没有铃舌的铜铃。爷爷只看了一眼便让人烧树。录像里没有火声，却在每次画面卡顿时传出一下铃响，空气里始终有潮湿草木灰的味道。",
        sources: [{ type: "event", id: "10072" }],
      },
      {
        id: "animals-facing-mountain",
        order: 2,
        title: "朝山的动物",
        hint: "它们在等一个没有出现的人。",
        body: "入秋后，村里的狗和鸟会在傍晚同时朝北山伏低，既不叫也不逃。你沿着方向走，只找到七枚并排的湿脚印，尽头是一块写着“白石坳”的旧路碑。镇上的新旧地图都没有这个地名，老人却说那里从来不住外人。",
        sources: [{ type: "event", id: "10076" }],
      },
      {
        id: "returned-box",
        order: 3,
        title: "回来的盒子",
        hint: "丢掉的东西，比你更早回家。",
        body: "你第一次认真端详那个上锁的小盒子。木面没有接缝，锁孔里却不断凝出凉雾，底部刻着“甲子未满，勿启”。你把它丢进河里，第二天它又出现在祖宅柜中。家人坚持盒子一直都在，只是没人记得它最初属于谁。",
        sources: [
          { type: "event", id: "10073" },
          { type: "talent", id: "1048" },
        ],
      },
      {
        id: "mountain-film-set",
        order: 4,
        title: "山里的剧组",
        hint: "官方解释完整得像一份提前写好的答案。",
        body: "网上流传一段航拍：深山梯田间有人穿着旧式长衫生活，檐下悬着七枚无舌铜铃。官方通报称那是一处电视剧外景地，但影片、剧组和审批记录均查不到。原视频被删除前，有人截到路牌上三个字——白石坳。",
        sources: [{ type: "event", id: "10422" }],
      },
      {
        id: "missing-actors",
        order: 5,
        title: "不存在的演员",
        hint: "他们只是换了一张更旧的照片。",
        body: "你托人找到一张所谓剧组的合影。照片上的人没有看镜头，像在看拍照者身后。县志里一张百年前的赈灾合照出现了同样的脸，姓名也完全相同。两张照片背后都写着一句话：借一岁，过一岭；字迹尚有潮气。",
        sources: [{ type: "event", id: "20422" }],
      },
      {
        id: "ancestral-pill",
        order: 6,
        title: "祖传药丸",
        hint: "病好了，旧日的身体也跟着改变。",
        body: "祖母临终前交给你一颗药丸，说家里每代只能留给一个人。药面有七道浅痕，闻起来像雨后的草木灰。服下后，高烧当夜退去，医院却发现你一张童年旧片上的骨缝也随之改变。报告次日被改成了录入错误。",
        sources: [{ type: "talent", id: "1065" }],
      },
      {
        id: "roadside-last-words",
        order: 7,
        title: "公路上的遗言",
        hint: "一句胡话，在另一份档案里有了回声。",
        body: "新闻称一名年轻人遭泥头车撞击，临死前高喊自己是“三转渡劫大能”，警方判断其意识混乱。你认出他正是剧组合影最边上的人。更奇怪的是，四十一年前的失踪人口档案里已有他的指纹，年龄仍写二十七岁。",
        sources: [{ type: "event", id: "10781" }],
      },
      {
        id: "book-seller",
        order: 8,
        title: "卖书的人",
        hint: "监控里只有你，地上却有两个人的脚印。",
        body: "旧车站的乞丐向你兜售一本“仙法”，没问姓名便叫出你小时候的小名，还说白石坳的人在等“丢盒子的那个孩子”。你回头寻找时，监控从头到尾只有你一个人；留在地上的旧书却带着潮气，旁边清楚印着两双湿脚印。",
        sources: [
          { type: "event", id: "10458" },
          { type: "event", id: "20461" },
        ],
      },
      {
        id: "sealed-mountain",
        order: 9,
        title: "封山之后",
        hint: "你到过那里，地图却比你更早知道。",
        body: "你按旧路碑的方向进山。导航多出七公里，油表却没有变化；雾散时，谷里只剩拆空的木屋和刚熄的灶灰。屋檐没有铜铃，手机录音中却响了七次。返程后，官方地图突然新增“白石影视基地”，标注已关闭十八年。",
        sources: [
          { type: "event", id: "10787" },
          { type: "event", id: "10788" },
        ],
      },
      {
        id: "unmailed-reply",
        order: 10,
        title: "未寄出的回信",
        hint: "盒子终于开了，却没有告诉你答案。",
        body: "数月后，小盒子自行开了一线。里面没有法门或药方，只有一张空白户籍页，纸角写着“外人已归”。你再看那张百年前的合影，拍照者身后的影子似乎多了一个，衣着与你进山当天相同。至于那是不是你，照片始终不肯显出脸。",
        sources: [
          { type: "event", id: "10361" },
          { type: "event", id: "40061" },
          { type: "event", id: "40050" },
        ],
        minimumPriorClues: 6,
      },
    ],
  },
  {
    id: "seventh-pier",
    title: "第七码头来电",
    partialTitle: "潮声记录",
    revealAfter: 4,
    eyebrow: "克苏鲁线 · 一组来源无法确认的沿海录音",
    introduction: "这些记录来自一名再普通不过的上班族。关于停电、离职员工和港口封锁的解释各自都说得通，只有录音里的潮声总比当地潮汐早七分钟。",
    recurringMotifs: ["03:17", "三短一长", "黑色盐渍", "第七码头"],
    ending: "录音到这里全部中断。你确实离开了第七码头，可究竟是谁回到了家，记录里没有答案。",
    clues: [
      {
        id: "cthulhu-dead-radio",
        order: 1,
        title: "没有电池的收音机",
        hint: "空频里播出的不是节目，而是一段尚未发生的潮汐。",
        body: "你加班回家后，旧收音机在没有电池时自行亮起。空频里只有潮声，夹着三短一长的敲击。第二天物业通知昨夜整栋楼停电检修。你把录音发给朋友，他却只听见有人叫你的名字，文件日期显示为你尚未入职的七年前。",
        sources: [{ type: "talent", id: "1128" }],
      },
      {
        id: "cthulhu-backward-footprints",
        order: 2,
        title: "倒着走来的脚印",
        hint: "楼道里没有人，感应灯却从顶层一盏盏亮下来。",
        body: "凌晨三点十七分，楼道感应灯依次从顶层向下亮起。门外留着一串湿脚印，脚趾方向全都朝着电梯，像有人倒着走来。监控只拍到你开门查看，画面里你身后站着一团比门框更高的潮湿阴影。保安说那只是压缩故障。",
        sources: [{ type: "event", id: "11335" }],
      },
      {
        id: "cthulhu-forgotten-colleague",
        order: 3,
        title: "无人记得的同事",
        hint: "他的文件写着你的笔迹，工位却从未有人使用。",
        body: "公司让你接手一名离职同事的项目，所有人都说从没见过他。可文件里满是他的批注，笔迹与你一模一样。抽屉底部有张第七码头的储物票，存取时间固定在03:17。当天工资账户多出一笔补发款，备注只有“三短一长”。",
        sources: [{ type: "event", id: "11336" }],
      },
      {
        id: "cthulhu-seventh-floor",
        order: 4,
        title: "不应存在的七层",
        hint: "电梯多停了一层，管理员却说仓库从来没有电梯。",
        body: "你按储物票地址找到旧港仓库。电梯按钮只有六层，门却在七层打开。里面堆着贴有你姓名的纸箱，生产日期横跨几十年。最里面的箱子传出缓慢敲击，你没有打开。离开时，管理员坚持这栋楼从来没有电梯。",
        sources: [{ type: "event", id: "11337" }],
      },
      {
        id: "cthulhu-second-shadow",
        order: 5,
        title: "第二个离开的人",
        hint: "你独自走进仓库，录像里却有两个人出来。",
        body: "警方调取仓库录像，认定只是年轻人探险恶作剧。画面中你独自进入，却有两个人影离开；另一个始终贴着你的脚步，走动时没有关节。你签完笔录才发现，值班警员胸牌上的照片，正是那位无人记得的同事。",
        sources: [{ type: "event", id: "11338" }],
      },
      {
        id: "cthulhu-sealed-pier",
        order: 6,
        title: "封闭的第七码头",
        hint: "危化品泄漏的通报外，防波堤上站满了背对海面的人。",
        body: "你收到一封无寄件人的快递，里面是防水工牌和一把锈钥匙。新闻恰好通报第七码头因危化品泄漏封闭。你远远看见防波堤上站满背海而立的人，每次浪落，他们便同时向前一步，口中念着与收音机相同的节奏。",
        sources: [
          { type: "event", id: "11339" },
          { type: "event", id: "11340" },
        ],
      },
      {
        id: "cthulhu-nameless-ferry",
        order: 7,
        title: "没有船号的夜航船",
        hint: "登船名单写着明天的日期，最后一位乘客与你同名。",
        body: "工牌让你通过了封锁。港内停着一艘没有船号的旧客轮，登船名单最后一页只有你的姓名，签署日期是明天。广播反复要求乘客返回舱房，可走廊两侧的门后全是海水拍击声。你砸开救生窗，窗外却是自家客厅。",
        sources: [
          { type: "event", id: "11341" },
          { type: "event", id: "11342" },
        ],
      },
      {
        id: "cthulhu-dry-clothes-black-salt",
        order: 8,
        title: "干衣服与黑盐",
        hint: "医院说你从未落水，鞋底却留下了不属于近海的盐。",
        body: "你从客厅醒来，衣服干燥，鞋底却黏着黑色盐粒。医院判断是疲劳与短暂失忆。医生离开后，隔壁空病床的心电监护突然亮起，波形恰好组成三短一长。护士匆忙拔掉电源，屏幕仍显示03:17，像在等待下一次潮汐。",
        sources: [
          { type: "event", id: "11343" },
          { type: "event", id: "11344" },
        ],
      },
      {
        id: "cthulhu-rewritten-report",
        order: 9,
        title: "被改写的事故通报",
        hint: "报告称无人失踪，照片里的海面却亮着整座城市的灯。",
        body: "一周后，港口事故通报称无人伤亡，也不存在失踪客轮。你保存的照片全部变成漆黑海面，放大后能看见水下排列着许多亮点，数量与城市住户一致。朋友劝你别再查，因为他刚收到物业通知：今晚全城水管将统一检修。",
        sources: [
          { type: "event", id: "11345" },
          { type: "event", id: "11346" },
        ],
      },
      {
        id: "cthulhu-already-home",
        order: 10,
        title: "已经回家",
        hint: "敲门声停下以后，潮水从屋内开始上涨。",
        body: "凌晨三点十七分，整座城市同时停水。门外响起三短一长，你没有开门。片刻后，厨房水槽开始向上滴水，黑色盐渍沿天花板汇成你的名字。收音机里有人用你的声音说“已经回家”。第二天一切正常，只是镜中你的衣角仍在滴水。",
        sources: [
          { type: "event", id: "11347" },
          { type: "event", id: "11348" },
        ],
        minimumPriorClues: 7,
      },
    ],
  },
];

export function findWeirdTaleClue(source: WeirdTaleSource): WeirdTaleClue | null {
  for (const line of WEIRD_TALE_LINES) {
    const clue = line.clues.find((candidate) => candidate.sources.some(
      (entry) => entry.type === source.type && entry.id === source.id,
    ));
    if (clue) return clue;
  }
  return null;
}

export function discoveredWeirdTaleIds({
  eventIds,
  talentIds,
}: {
  eventIds: readonly RemakeId[];
  talentIds: readonly RemakeId[];
}) {
  const seenEvents = new Set(eventIds.map(String));
  const seenTalents = new Set(talentIds.map(String));
  const discovered = new Set<string>();

  for (const line of WEIRD_TALE_LINES) {
    line.clues.forEach((clue, index) => {
      const sourceSeen = clue.sources.some((source) => (
        source.type === "event" ? seenEvents.has(source.id) : seenTalents.has(source.id)
      ));
      const priorDiscovered = line.clues
        .slice(0, index)
        .filter((candidate) => discovered.has(candidate.id))
        .length;
      if (sourceSeen && priorDiscovered >= (clue.minimumPriorClues ?? 0)) {
        discovered.add(clue.id);
      }
    });
  }

  return discovered;
}
