import type { RemakeId } from "../life/remake-engine";
import {
  CTHULHU_CEMETERY_EVENT_ID,
  CTHULHU_CEMETERY_MAX_AGE,
  CTHULHU_CEMETERY_MIN_AGE,
  CTHULHU_CEMETERY_TALENT_ID,
  DOUBLE_FISH_EVENT_AGE,
  DOUBLE_FISH_EVENT_ID,
  DOUBLE_FISH_TALENT_ID,
  EIGHTIES_GHOST_EVENT_ID,
  EIGHT_FOOT_WOMAN_EVENT_ID,
  EIGHT_FOOT_WOMAN_MAX_AGE,
  EIGHT_FOOT_WOMAN_MIN_AGE,
  EIGHT_FOOT_WOMAN_TALENT_ID,
  GONGGONG_BLOODLINE_TALENT_ID,
  GONGGONG_ZHURONG_EVENT_ID,
  GONGGONG_ZHURONG_MAX_AGE,
  GONGGONG_ZHURONG_MIN_AGE,
  KUNLUN_BONES_EVENT_ID,
  KUNLUN_BONES_MAX_AGE,
  KUNLUN_BONES_MIN_AGE,
  KUNLUN_BONES_TALENT_ID,
  MALE_BIRTH_EVENT_ID,
  PENGLAI_EVENT_ID,
  PENGLAI_MAX_AGE,
  PENGLAI_MIN_AGE,
  PENGLAI_TALENT_ID,
  SAND_SEA_EVENT_ID,
  SAND_SEA_MAX_AGE,
  SAND_SEA_MIN_AGE,
  SAND_SEA_TALENT_ID,
  SHAMBHALA_EVENT_AGE,
  SHAMBHALA_EVENT_ID,
  SHAMBHALA_TALENT_ID,
  SPECIAL_PROLOGUE_EVENT_IDS,
  SPECIAL_RUMOR_EVENT_IDS,
} from "./site-event-overrides";

export type SpecialEndingPage = {
  image: string;
  text: string;
};

export type SpecialEndingChapter = {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  ending: string;
  entryLabel: string;
  completionLabel: string;
  transition: string;
  pages: readonly SpecialEndingPage[];
};

export type SpecialEnding = {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  ending: string;
  entryMode: "optional" | "forced";
  outcome: "resume" | "end-life";
  triggerTitle: string;
  triggerPremise: string;
  triggerLead: string;
  entryLabel: string;
  completionLabel?: string;
  resumeMessage?: string;
  skipLabel?: string;
  requiredTalentId?: RemakeId;
  prologueEventIds?: readonly RemakeId[];
  rumorEventId?: RemakeId;
  triggerAge?: number;
  triggerAgeRange?: readonly [number, number];
  sourceEventIds: readonly RemakeId[];
  pages: readonly SpecialEndingPage[];
  mirrorChapter?: SpecialEndingChapter;
};

export const UNLOADED_HOMETOWN_ID = "unloaded-hometown";
export const SHAMBHALA_WORLD_ID = "shambhala-world";
export const EIGHTIES_ROOM_ID = "eighties-room";
export const GONGGONG_ZHURONG_ID = "gonggong-zhurong";
export const PENGLAI_ROUTE_ID = "penglai-route";
export const PENGLAI_MIRROR_ID = "penglai-route-reverse";
export const DOUBLE_FISH_JADE_ID = "double-fish-jade";
export const CTHULHU_CEMETERY_ID = "cthulhu-cemetery";
export const KUNLUN_BONES_ID = "kunlun-bones";
export const SAND_SEA_ID = "sand-sea-beneath";
export const EIGHT_FOOT_WOMAN_ID = "eight-foot-woman";

const UNLOADED_HOMETOWN_PREQUEL_PAGES: readonly SpecialEndingPage[] = Array.from(
  { length: 25 },
  (_, index) => ({
    image: `/remake-tales/unloaded-hometown/${String(index + 1).padStart(2, "0")}.webp`,
    text: "",
  }),
);

function talePages(folder: string, texts: readonly string[]): readonly SpecialEndingPage[] {
  return texts.map((text, index) => ({
    image: `/remake-tales/${folder}/${String(index + 1).padStart(2, "0")}.webp`,
    text,
  }));
}

const DOUBLE_FISH_TEXTS = [
  "二十一岁那年，你和同学顾衡坐上了西行的列车。",
  "那张旧航片被你夹在地图里。图上的气象站，任何现代坐标都无法对应。",
  "档案只留下四十三天记录。最后一句是：今天，太阳落下了两次。",
  "你们找到了当年勘察队的一名幸存者。他只问，你们是不是也看见了那座站。",
  "沙漠边缘没有路。向导却认得航片上一条早已消失的河床。",
  "越野车驶入罗布泊以后，指南针开始缓慢回转。",
  "第一晚，远处亮起了一盏不该存在的灯。",
  "天亮后，沙地里多出一排与你们鞋底完全相同的脚印。",
  "脚印来自前方，却停在昨夜扎营的位置。",
  "午后，废弃的观测杆从盐壳下露了出来。编号正是航片上的那一根。",
  "气象站比档案中的照片更新，门锁上甚至没有锈。",
  "值班室里放着一份今天的天气记录。落款是你的名字。",
  "你们在车旁摊开地图。两个相同的坐标，指向相反的方向。",
  "太阳贴近地平线时，西边又亮起了第二团暮色。",
  "那不是倒影。两道影子同时被拉向你们身后。",
  "站内的镜面装置仍在运转，中央压着一枚双鱼形的玉佩。",
  "顾衡触到玉佩后，房间里多出了一次呼吸。",
  "门外站着另一个顾衡。衣服上的尘土，连位置都完全一样。",
  "两个人都记得一路上的每句话，也都说另一个是复制品。",
  "无线电忽然接通。三十多年前的声音要求你立即关闭装置。",
  "你砸断电源时，第二个太阳开始无声坠落。",
  "气象站像被热浪抹去。你只来得及抓住离你最近的那只手。",
  "沙暴过去，队伍少了一个人，却没人能确定少的是谁。",
  "返程名单上，顾衡的身份证号出现了两次。",
  "你把玉佩锁进档案柜。第二天，柜里只剩一条首尾相接的划痕。",
  "回程列车的玻璃映出五个人。座位上，明明只坐着四个。",
] as const;

const CTHULHU_CEMETERY_TEXTS = [
  "研二那年，你在实验室重新整理一组深潜影像。",
  "七千米深处，鲸骨沿海沟排列，时间跨度超过五百三十万年。",
  "不同时代的遗骸，全都朝向同一个方向。",
  "论文把它解释为洋流。原始数据里，却没有任何对应的流速变化。",
  "两个月后，你获得了一次载人深潜的观察席。",
  "潜器下沉。最后一缕自然光在两千米处熄灭。",
  "声呐首先扫到一根鲸肋，随后是第二根、第三根。",
  "它们并非散落，而是像路标一样留出一条通道。",
  "你们沿着鲸骨走廊继续下降。海沟比海图标注的更深。",
  "通讯里混进极低的噪声。节律与鲸歌相似，却慢了几百倍。",
  "舷窗外的海床平整得过分，像有什么东西长期从这里经过。",
  "机械臂碰到一块骨片。所有仪表同时归零了三秒。",
  "灯光恢复时，骨片上多出了一圈不属于鲸类的齿痕。",
  "前方出现一具完整鲸骸。它保持着向下游动的姿势。",
  "鲸腹下面压着一枚仍在闪烁的旧式定位器。",
  "定位器的编号，属于一艘四十年前失踪的调查船。",
  "海沟尽头传来一次震动。两侧鲸骨随之轻轻抬起。",
  "黑暗里睁开了一片比潜器更大的反光面。",
  "驾驶员切断照明，凭惯性上浮。那阵低鸣始终跟在下方。",
  "回收影像时，最后十七分钟全部损坏，只剩一帧向上的鲸骨。",
  "潜器被吊回甲板。海面下，一个巨大的圆影停留了很久。",
] as const;

const KUNLUN_BONES_TEXTS = [
  "你在旧档案室找到一盘没有编号的磁带。",
  "录音来自1983年失踪的昆仑山地质勘察队。",
  "杂音尽头，有人说：不要顺着骸骨面对的方向走。",
  "旧地图上，黑石沟被红笔反复圈过。",
  "你带上向导阿木和摄影师陈川，沿勘察队留下的路线进山。",
  "当地人没有阻拦，只问你们是否带了录音机。",
  "第一天，路边出现一具完整的羚羊骨架。",
  "它的头朝向山谷深处。",
  "继续前行，每一具动物骸骨都保持着同样的方向。",
  "阿木说，活着的动物从不会进入那片坡地。",
  "陈川拍下骸骨。相机回放里，骨架旁多站着一个人。",
  "那个人穿着旧式勘察服，脸被阴影遮住。",
  "夜里，磁带在没有电池的录音机里自行转动。",
  "陌生声音念出了你们三个人的名字。",
  "第二天，地图上多出了一条细线。终点指向骸骨面对的山洞。",
  "你们没有讨论，却同时收拾了行装。",
  "山洞口散落着生锈的测量器材，编号与失踪队伍一致。",
  "天色已晚，你们在骸骨附近扎营。",
  "半夜，帐篷外响起脚步。只有两个人的脚印，却绕了营地三圈。",
  "阿木不见了。他的背包仍在原处。",
  "你和陈川沿新增路线走进山洞。",
  "洞壁上刻着日期，从1983年一直写到今天。",
  "废弃设备仍在工作，磁带里的声音正从更深处传来。",
  "你们找到当年的营地。食物没有腐坏，煤油灯还是温的。",
  "桌上摆着三张刚刚拍下的照片。最后一张里没有陈川。",
  "身后传来陈川的声音，叫你不要回头。",
  "同一句话，又从前方的黑暗里响起。",
  "录音机自动播放下一段：洞外的人，不一定是出去的人。",
  "你关掉设备，洞顶随即落下细碎的灰。",
  "阿木从岔路走来。他说自己从未离开营地。",
  "三个人一起退回山谷，骸骨的头却已经全部转向洞外。",
  "下山后，你们交出的影像只剩空白。",
  "陈川坚持说，同行的始终只有两个人。",
  "磁带被封存。那张油纸地图却再次出现在你的行李里。",
  "第二天，新增路线的终点变成了你现在住的房间。",
] as const;

const SAND_SEA_EPISODE_ONE_TEXTS = [
  "几年来，所有人都以为这段沙海只是一片死寂的荒漠。",
  "直到一次卫星扫描，屏幕上出现了不该存在的轮廓。",
  "沙层下面，竟然藏着一座完整城市。",
  "那些线条太整齐了，像是被规划过的街道。",
  "它不可能自然形成。这里一定埋着某种人造遗迹。",
  "几天后，你带着设备和勘探队进入无人沙漠。",
  "那里没有路，也没有人知道沙子下面究竟是什么。",
  "卫星显示，城市中心就在你们脚下。",
  "第一组地面雷达数据出来后，所有人都沉默了。",
  "地下不只有建筑，规模也远远超过最初的预估。",
  "你们开始挖掘。第一层沙土松得不合常理。",
  "第一堵露出的石墙，证明这里不是普通遗址。",
  "继续清理后，一扇完整的石门出现在沙下。",
  "门上的符号，不属于任何已知的文字体系。",
  "门后并不是墓穴，而是一条通往地下的道路。",
  "走进内部时，整座城市像是昨天才被封住。",
  "这里有街道、宫殿，也有城市该有的一切。",
  "巨大的石制建筑，说明这里曾拥有极高的建造能力。",
  "脚下没有泥沙，甚至还保留着完整的地下水渠。",
  "真正的秘密，藏在这些建筑的文字里。",
  "很快，你们找到一间完整房间。里面不是祭祀用品，而是普通人的生活器物。",
  "没有战争痕迹，也没有任何人横死留下的痕迹。",
  "更奇怪的是，入口并不是从外面封死的。",
  "他们是在进入城市以后，亲手把自己封在了地下。",
  "石碑最后留下的，不是告别，而是一句话。",
  "当最后一扇门关闭，我们将继续向下。",
  "手持雷达对宫殿地下，又进行了一次扫描。",
  "结果显示，你们发现的这座城市，只是最上面的一层。",
  "在砖墙最深处，还有一扇从未被打开过的门。",
  "这座城市不是被沙掩埋的。它在地下，沉睡了三千年。",
] as const;

const SAND_SEA_EPISODE_TWO_TEXTS = [
  "第三天，你们决定打开那扇尘封三千年的石门。",
  "石门开启后，黑暗里是一道仍在向下延伸的阶梯。",
  "那里没有岔路，只有一条路不断向下。",
  "走了十分钟，你们仍没有抵达尽头。",
  "奇怪的是，越往下，温度反而越高。",
  "到底以后，你们听见了地下传来的流水声。",
  "阶梯尽头，是一座规模更加庞大的第二层城市。",
  "它至少是上一层城市的四倍。",
  "你们很快发现了第一个不该存在的细节。",
  "这里的街道，比上面的城市还要干净。",
  "三千年过去了，城里的水渠竟然仍在工作。",
  "检测结果正常。这些水一直在流动。",
  "而水源，并不来自地表。",
  "第二层城市，比第一层保存得更加完整。",
  "所有痕迹都说明，他们曾在这里生活了很长时间。",
  "这里甚至还有足够维持数万人生活的粮仓。",
  "到了这里，你们终于确定：这不是一个临时避难所。",
  "他们从一开始，就准备永远生活在地下。",
  "墙上的记录却说，他们仍在寻找更深的地方。",
  "数千年里，这座城市始终有人记录日常。",
  "越往深处，所有主要街道越像是在通向同一个地方。",
  "城市中心没有王宫，只有一座完全封闭的圆形建筑。",
  "你们原以为那里是神庙，可里面什么都没有。",
  "大厅中央，只有一口看不到底的井。",
  "你们试了三次，都没有测到它的底部。",
  "直到井壁上，出现了这个文明留下的最后一段记录。",
  "当地面的世界重新适合生存，我们自然会回来。",
  "最后一次扫描表明，深井以下仍有更庞大的结构。",
] as const;

const SAND_SEA_EPISODE_THREE_TEXTS = [
  "如果他们一直在等待返回地表，那么，他们当年究竟去了哪里？",
  "为了找到答案，你们重新整理了所有考古记录。",
  "整座城市的使用痕迹都说明，那里的人曾全部朝同一个方向离开。",
  "唯一留下的线索，就是城市中央那口深井。",
  "你开始怀疑，这口井也许就是他们离开第二层城市的路。",
  "探测器下放很久，依旧没有抵达尽头。",
  "人员开始沿绳索下降。",
  "没过多久，井壁上的凹槽开始呈现规则排列。",
  "那是安装升降装置留下的痕迹，而且远比现在的设备更实用。",
  "到这里，你们终于决定沿这条路线继续下去。",
  "随着井口越来越远，第二层城市的声音消失了。",
  "不久，你们遇到了第一处人工平台。",
  "这里不是废弃设施。平台上还留着粮食和生活痕迹。",
  "他们进入这里，显然不止是为了进行一次短暂探索。",
  "短暂记录后，你们继续沿着他们留下的路线下降。",
  "更深的位置，又出现了一处类似的平台。",
  "器物的变化说明，他们并非一次性下行，而是在不断向更深处迁移。",
  "就这样，平台越来越简陋，但人类活动的痕迹没有消失。",
  "到了这里，井壁的凹槽仍在向下延伸。",
  "井壁文字只剩三个意思：向下、水、居所。",
  "继续下降后，井里的环境开始明显变化。",
  "氧气正在下降，温度却在升高。深处可能存在水汽循环。",
  "最终，你们抵达了一处被岩壁封死的位置。",
  "岩壁下嵌着一块几乎无法辨认的石碑。",
  "人员无法继续前进。你们只能让摄像机和机器人继续向下。",
  "这一次，你们第一次确定：最深的平台下面，仍然存在人工建筑。",
  "设备信号开始中断，入口处的安全绳也已经所剩无几。",
  "最后，你们决定在这里停止下降。",
  "几小时后，升降器重新回到第二层城市。",
  "影像却显示，第二层城市的地面之下还有建筑轮廓。",
  "第二天，你们结束了这次地下调查。",
  "复测结果表明，这不是几层遗址，而是一张连向更深处的地下网络。",
  "三千年前，他们究竟走到了多深，以现在的能力仍无法知道。",
  "你原以为，这一次已经足够接近真相。",
  "返航途中，飞机前方忽然出现一片巨大且绕不开的云团。",
] as const;

const EIGHT_FOOT_WOMAN_TEXTS = [
  "大二暑假，你决定回乡下的老宅住几天。",
  "行李不多。那间屋子已经空了很久。",
  "返乡大巴离开城区后，乘客渐渐睡着了。",
  "半路上，你看见一个全身黑衣的女人。她站着，头顶几乎碰到车顶。",
  "你回头看了第二次。她也正隔着墨镜看你。",
  "到站时天还很亮。老宅门口的对联已经褪色。",
  "屋里和记忆中一样，只是安静得过分。",
  "你收拾出临街的小房间，决定住到假期结束。",
  "傍晚，你在电脑屏幕的反光里看见窗外多了一顶黑帽子。",
  "转过身时，窗外什么也没有。",
  "第二天，那顶帽子从院墙上方缓慢经过。",
  "墙外没有梯子。你沿着墙找了一圈，也没有脚印。",
  "你开始整夜开着灯。白天，一切又显得很普通。",
  "第三天傍晚，她站在厨房窗外。",
  "天完全黑下去后，她仍在原处。",
  "你从柜子里翻出一根旧木棍。祖母以前把它放在这里，却从没说过用途。",
  "门外的脚步声停了。你等了很久，还是推开了门。",
  "雨水刚停，巷子里只有你自己的呼吸。",
  "黑衣在前方拐过弯。她似乎在等你跟上。",
  "路灯照不到的地方，她第一次停了下来。",
  "你跟到村外那座废弃多年的厂房。",
  "她无声地穿过铁门。你追进去时，里面传来金属碰撞的回声。",
  "地面堆着拆下来的木板，木板下面没有灰。",
  "最深处的一扇门开着。门后垂着许多黑色布料。",
  "厂房里没有那个女人。只有一排尚未披好外衣的东西。",
] as const;

export const SPECIAL_ENDINGS: readonly SpecialEnding[] = [
  {
    id: UNLOADED_HOMETOWN_ID,
    title: "未加载的世界",
    kicker: "真结局 · 日光之外",
    summary: "飞升后的第二次人生里，父亲睡着后，家与村庄开始消失。只有被他记得的旧路，才会从灰白中重新出现。",
    ending: "世界是假的，爱是真的。",
    entryMode: "forced",
    outcome: "end-life",
    triggerTitle: "帷幕后有什么",
    triggerPremise: "第二次人生里，你仍旧像普通人一样长大。大学毕业前，一段感情结束了。你在宿舍躺了几天，最后拖着行李回了老家。",
    triggerLead: "你终于下定决心，颤抖着掀开了隐藏帷幕的一角。刹那间，周围的世界如雪花般无声消融。",
    entryLabel: "揭开帷幕",
    sourceEventIds: ["21305", "21306", "21307", "21308"],
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.unloadedHometown,
    pages: [
      ...UNLOADED_HOMETOWN_PREQUEL_PAGES,
      ...[
      { image: "/remake-tales/unloaded-hometown/01.webp", text: "失恋后我回老家住几天。本来一切都挺正常，直到我爸一睡着，整个家竟然开始消失。" },
      { image: "/remake-tales/unloaded-hometown/02.webp", text: "我赶紧把他叫醒，可他看到眼前这一幕也彻底愣住了。" },
      { image: "/remake-tales/unloaded-hometown/03.webp", text: "周围什么都没了，只剩下一片灰白。" },
      { image: "/remake-tales/unloaded-hometown/04.webp", text: "连院门外的路都消失了，我们只能先想办法出去。" },
      { image: "/remake-tales/unloaded-hometown/05.webp", text: "我爸试着回忆以前去村口走的那条老路。" },
      { image: "/remake-tales/unloaded-hometown/06.webp", text: "他刚说完，灰白里真的出现了一小段泥路。" },
      { image: "/remake-tales/unloaded-hometown/07.webp", text: "连我爸自己都懵了。他根本不知道这是怎么回事。难道我的老爸是造物主？" },
      { image: "/remake-tales/unloaded-hometown/08.webp", text: "没别的办法，只能让他一路回忆着往前走。" },
      { image: "/remake-tales/unloaded-hometown/09.webp", text: "他说起旧小学和石桥，前面的路就一点点出现。" },
      { image: "/remake-tales/unloaded-hometown/10.webp", text: "可我们刚走过去，身后的村子又开始消失。" },
      { image: "/remake-tales/unloaded-hometown/11.webp", text: "我们一路摸索着走，最后走到了村口的老车站。" },
      { image: "/remake-tales/unloaded-hometown/12.webp", text: "可村口外面什么都没有，还是那片灰白。" },
      { image: "/remake-tales/unloaded-hometown/13.webp", text: "我为了印证心中的猜想，问他知不知道我大学那边是什么样。他只说自己从没去过，不知道。" },
      { image: "/remake-tales/unloaded-hometown/14.webp", text: "果然，能出现的都是我们一起走过的老地方。" },
      { image: "/remake-tales/unloaded-hometown/15.webp", text: "身后的路也快没了，我们已经回不去了。我好像意识到了什么。" },
      { image: "/remake-tales/unloaded-hometown/16.webp", text: "正当我准备走进未知区域时，我爸一把拉住我：前面什么都没有，你还要走？" },
      { image: "/remake-tales/unloaded-hometown/17.webp", text: "我不知道，但总得往前走。" },
      { image: "/remake-tales/unloaded-hometown/18.webp", text: "他沉默了一会儿：前面的路，爸不能陪你了。你得自己走下去。" },
      { image: "/remake-tales/unloaded-hometown/19.webp", text: "我看着前面的灰白，深吸一口气，还是走了进去。" },
      { image: "/remake-tales/unloaded-hometown/20.webp", text: "一阵眩晕感袭来，就像当时在客车上醒来的感觉一样。再睁眼时，这里已经不是那片灰白。" },
      { image: "/remake-tales/unloaded-hometown/21.webp", text: "这是医院吗？我爸也在。医生说，回家那天客车出了事故，我已经昏迷很多天了。" },
      { image: "/remake-tales/unloaded-hometown/22.webp", text: "爸说，我昏迷时他讲了很多以前的事。医生说，多说些熟悉的事情，对恢复有帮助。" },
      { image: "/remake-tales/unloaded-hometown/23.webp", text: "我转头看到行李里那副还没拆封的新眼镜，示意他戴上。" },
      { image: "/remake-tales/unloaded-hometown/24.webp", text: "他接过眼镜，只说：买这个干什么，浪费钱。" },
      { image: "/remake-tales/unloaded-hometown/25.webp", text: "世界是假的，但爱是真的。" },
      ].map((page, index) => ({
        ...page,
        image: `/remake-tales/unloaded-hometown/${String(index + 26).padStart(2, "0")}.webp`,
      })),
    ],
  },
  {
    id: SHAMBHALA_WORLD_ID,
    title: "香巴拉世界",
    kicker: "红色特殊事件 · 香巴拉手稿",
    summary: "祖父没有写完的研究，将你带向一条不存在于地图上的路线。",
    ending: "这是……香巴拉吗？",
    entryMode: "forced",
    outcome: "resume",
    triggerTitle: "手稿最后一页",
    triggerPremise: "二十岁那年，你重新翻出了祖父留下的手稿。最后几页记录着一条没有出现在任何地图上的路线。",
    triggerLead: "你带走了手稿，也找到了几个愿意同行的人。",
    entryLabel: "沿着坐标出发",
    requiredTalentId: SHAMBHALA_TALENT_ID,
    prologueEventIds: SPECIAL_PROLOGUE_EVENT_IDS.shambhala,
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.shambhala,
    triggerAge: SHAMBHALA_EVENT_AGE,
    sourceEventIds: [SHAMBHALA_EVENT_ID],
    pages: [
      "我今年20多，在国内读个双非本科。",
      "爷爷是研究藏学的高级知识分子。",
      "爷爷很疼我，但不让我碰他柜子里的东西。我从大人的交谈中知道，是关于香巴拉的。香巴拉据说是隐藏在世界尽头的富饶世界。",
      "我打算偷偷带着爷爷的手稿，和同好一起探索这个秘密。",
      "没想到几个同好的网友真的愿意陪我去。",
      "坐火车去拉萨。",
      "再租辆车去阿里。",
      "在牧民大叔家过夜。",
      "一夜无话。",
      "大叔的儿子给我们当向导。",
      "冈仁波齐到了。",
      "徒步。",
      "偷出来的爷爷手稿上的地图。",
      "突然开始下大雨了。",
      "雨停了！这个彩虹指向了一处岩壁。",
      "这……",
      "",
      "",
      "",
      "",
      "这个幕墙后面是什么？",
      "这个东西是什么！？",
      "",
      "",
      "这里是个大厅。",
      "这个井是什么？",
      "这是！！！香巴拉吗？？",
    ].map((text, index) => ({
      image: `/remake-tales/shambhala-world/${String(index + 1).padStart(2, "0")}.webp`,
      text,
    })),
  },
  {
    id: EIGHTIES_ROOM_ID,
    title: "屋里七天",
    kicker: "红色特殊事件 · 八十年代旧档案",
    summary: "一名叫建明的大学生听从陌生和尚的告诫，在密闭房间里待了七天。第八天，屋里只剩一块松动的地砖。",
    ending: "地砖下面，是几口母亲从不知道的大缸。",
    entryMode: "optional",
    outcome: "resume",
    triggerTitle: "借阅簿上的名字",
    triggerPremise: "你在学校旧阅览室的报废书柜里，发现一本八十年代的借阅簿。建明这个名字，连续七天写在同一个房间号后面。",
    triggerLead: "夹在簿册里的照片没有日期。最后一张，只拍到一块被撬开的地砖。",
    entryLabel: "翻开旧档案",
    skipLabel: "暂时合上",
    sourceEventIds: [EIGHTIES_GHOST_EVENT_ID],
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.eightiesRoom,
    pages: [
      "上个世纪八十年代，有一个叫建明的大学生。这天，他正要去上学。",
      "他远远看见对面走来一个人。",
      "那人说：施主，您最近有大灾。建明当然不信。",
      "和尚准确说出了建明家里的情况，又说：想躲过灾祸，必须在密闭的房间待够七天。这七天，千万不能出来。",
      "建明回家，把这件事告诉了母亲。",
      "母亲开始为建明收拾出一间屋子。",
      "她放进食物，又用报纸糊上窗台。",
      "建明开始在小屋里独居。",
      "七天之间，屋里的声音越来越大。很难说清那到底是什么声音。建明始终没说过一句话，母亲终日在门前守候。",
      "第八日清晨，母亲打开门，建明不在房间里。",
      "第七日深夜，建明当厂长的舅舅接到陌生男人的电话：你外甥出事了，你快回来吧。电话随即挂断。",
      "舅舅立刻和司机驱车赶往姐姐的村子。他一路在想：打电话的人是谁？姐姐的村里，根本没有电话。",
      "到了村口，路旁站着一个看不清模样的人。那人问：你就是建明的舅舅吧？",
      "那人又说：舅舅，你看好了，我就是这么死的。",
      "那人扭头朝路边的湖水跑去。",
      "他立刻跳进湖中。舅舅只当那人是个疯子，没有理会，眼下更重要的是去见姐姐。",
      "建明的母亲见到弟弟，立刻大哭起来。",
      "舅舅翻遍那间小屋，没有发现任何有价值的信息，除了一块很奇怪的地砖。",
      "打开地砖，下面是几口大缸。建明的母亲从不知道，这个房间地下还有这些东西。",
      "大缸里，是一些肉块。",
    ].map((text, index) => ({
      image: `/remake-tales/eighties-room/${String(index + 1).padStart(2, "0")}.webp`,
      text,
    })),
  },
  {
    id: GONGGONG_ZHURONG_ID,
    title: "共工与祝融",
    kicker: "红色特殊事件 · 共工血脉",
    summary: "你跌进一个仍由巨骨、部落和神明支配的年代。没有人知道你从哪里来，只有天上的两道影子认出了你的血。",
    ending: "下一秒，你在自己的床上睁开眼。窗外天还没亮。",
    entryMode: "forced",
    outcome: "resume",
    triggerTitle: "两个太阳",
    triggerPremise: "十八岁以后，你开始反复梦见一片紫色荒地。梦里没有水，血液却总在靠近某个方向时发冷。",
    triggerLead: "这一次，你睁开眼，后脑传来钝痛。天上挂着两个太阳。",
    entryLabel: "从荒地上站起来",
    completionLabel: "从梦中醒来",
    resumeMessage: "你在自己的床上醒来。那段经历像一场梦，人生仍从这一年继续。",
    requiredTalentId: GONGGONG_BLOODLINE_TALENT_ID,
    prologueEventIds: SPECIAL_PROLOGUE_EVENT_IDS.gonggong,
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.gonggong,
    triggerAgeRange: [GONGGONG_ZHURONG_MIN_AGE, GONGGONG_ZHURONG_MAX_AGE],
    sourceEventIds: [GONGGONG_ZHURONG_EVENT_ID],
    pages: [
      "不知道发生了什么。你一睁眼，已经躺在一片陌生的荒地上。",
      "后脑仍在作痛。手机还在，信号却没有。",
      "脚边的草比人还高，叶片泛着不自然的紫色。",
      "这里没有道路，也没有任何你认识的地貌。",
      "你抬起头。天上挂着两个太阳。",
      "没走多远，一副比楼还大的骸骨横在荒野里。",
      "骨头表面冰冷。你摸到一道尚未风化的裂痕。",
      "草丛里钻出几个披着兽皮的人。你听不懂他们的话。",
      "他们没有碰你的手机，只围着你的鞋看了很久。",
      "天黑以前，他们把你带回了聚落。",
      "屋子由巨兽的骨架撑起。没有人觉得这有什么特别。",
      "他们递给你食物。你仍不知道自己到了哪里。",
      "你刚吃下一口，四周忽然安静。所有人同时伏在地上。",
      "云层后面，出现了两个缓慢移动的影子。",
      "它们站在群山之间。你终于明白，地上的巨骨从何而来。",
      "其中一个抬起手。远处的山，消失了。",
    ].map((text, index) => ({
      image: `/remake-tales/gonggong-zhurong/${String(index + 1).padStart(2, "0")}.webp`,
      text,
    })),
  },
  {
    id: PENGLAI_ROUTE_ID,
    title: "蓬莱航线",
    kicker: "红色特殊事件 · 海雾来客",
    summary: "一次寻常的出海，把你带进一支不该仍在海上的船队。三天以后，现代救援船在雾中找到了你。",
    ending: "你没有解释那三天。口袋里的木牌还带着海水的气味。",
    entryMode: "forced",
    outcome: "resume",
    triggerTitle: "雾里的木桨",
    triggerPremise: "毕业后的工作一直没有着落。大学室友叫你去海边住几天，第二天又带你上了一条小渔船。",
    triggerLead: "下午，低雾压住海面。导航开始乱跳，船底随即传来一次沉闷的撞击。",
    entryLabel: "向雾里的木船游去",
    completionLabel: "收起那块木牌",
    resumeMessage: "你回到原来的人生。只有那块木牌，证明海上的三天并非幻觉。",
    requiredTalentId: PENGLAI_TALENT_ID,
    prologueEventIds: SPECIAL_PROLOGUE_EVENT_IDS.penglai,
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.penglai,
    triggerAgeRange: [PENGLAI_MIN_AGE, PENGLAI_MAX_AGE],
    sourceEventIds: [PENGLAI_EVENT_ID],
    pages: [
      "毕业一个多月，工作仍没有着落。你每天醒来，都看见桌上那几份没有回音的简历。",
      "你去了顾衡住的海边。见面时，他只说先住几天，别急着回去。",
      "那晚你们吃了烧烤。关于工作的事，谁也没有再问。",
      "第二天，他带你出海钓鱼。船不大，天气原本也很好。",
      "下午两点以后，一层很低的雾贴着海面漫了过来。",
      "导航开始乱跳。老船长看着不停转动的指南针，没有说话。",
      "船底忽然传来重响。你没能抓住栏杆，翻进了海里。",
      "你向上游，却先看见一排巨大的木桨，从头顶缓慢划过。",
      "再次睁眼时，几张陌生的脸正围着你。他们的衣服没有一件属于现在。",
      "一个叫石生的人拿起你的手机。屏幕亮起时，他险些把它扔进海里。",
      "你走出船舱。雾里密密麻麻，全是木船。",
      "船上有女人、孩子、工匠，也有粮食与牲畜。没有人像是在拍戏。",
      "石生说，他们从琅邪出海，奉命寻找蓬莱、方丈与瀛洲。",
      "他指向领航船上的男人。那个人名叫徐市。",
      "第三天，淡水见底。甲板上的争执，比风浪更早失控。",
      "石生说，他只想换些粮食，让家里的母亲不必再向人告别。",
      "入夜后，他忽然抓住你。船侧下面，有东西又一次贴了上来。",
      "天亮时，船身多出一道很深的擦痕。没有人说那是什么留下的。",
      "黑色的背脊浮出海面，与木船并行。它长得看不见尽头。",
      "箭落在它身上，没有留下痕迹。船队开始散开。",
      "你点燃救生信号棒。红光照亮甲板，也照亮雾里那些惊惶的脸。",
      "浓雾后忽然刺来一道白光。石生下意识挡在你的身前。",
      "你坠回海里。木船与那只伸向你的手，一同退进雾中。",
      "救援船上的顾衡哭着道歉。他说只找了你五个小时。你却记得自己在那里过了三天。",
      "回到岸上，你从湿透的口袋里摸出一块木牌。上面的刻痕，仍清晰得像刚刚留下。",
    ].map((text, index) => ({
      image: `/remake-tales/penglai-route/${String(index + 1).padStart(2, "0")}.webp`,
      text,
    })),
    mirrorChapter: {
      id: PENGLAI_MIRROR_ID,
      title: "蓬莱航线·海雾另一侧",
      kicker: "蓬莱航线 · 石生记",
      summary: "木牌留下了海雾另一侧的记忆。那个把你从海里救起的人，也曾目送你回到两千年后。",
      ending: "海雾散去。有人跪下来，喊出了蓬莱。",
      entryLabel: "翻过木牌",
      completionLabel: "合上木牌",
      transition: "夜里，你无意间翻过木牌。潮湿的木纹里，浮出一段并不属于你的记忆。",
      pages: talePages("penglai-route-reverse", [
        "我叫石生，是秦朝人。家里最后一袋粮，也被他们拿走了。",
        "他们说，徐市奉皇帝之命出海寻找不死药。愿意去的人，可以领一袋粮。",
        "我报了名，终于给娘领到了一袋粮。",
        "娘说，跟着替皇帝办事的人，总不会饿死。",
        "到了琅邪码头，我才知道出海的人有多少。",
        "这是我第一次见到徐市。",
        "第二天清晨，所有船一起离开了岸。",
        "最开始，找仙山和我没有什么关系。收帆、补绳、打水，每天累得倒头就睡。",
        "慢慢地，船上的水开始不够。",
        "第一次有人死在船上。他比我大不了多少。",
        "当天夜里，一条船被撞塌了半边。老船工说，水下那个东西叫“鲛”。",
        "之后，船上的气氛开始紧张起来。",
        "一天下午，我看见一个穿着奇怪的人落了水。",
        "我伸手抓住了他。那身湿透的衣服，比海水还冷。",
        "他穿的是什么衣服？又是什么发式？",
        "他醒来后，问我：这里是在拍戏吗？",
        "他手里的黑色石片忽然发起光来，里面还有一个人。",
        "船上的人都说，他可能来自蓬莱。连徐市也亲自来看他。",
        "我告诉他，领头的人叫徐市。他好像并不感兴趣。",
        "他说自己来自两千年后。那里有不用马拉的车，也有会飞的铁鸟。",
        "第三天晚上，守夜的人突然喊了一声：鲛。我想把他拉回船舱。",
        "那一晚，我第一次看清它有多大。",
        "他忽然拿出一个东西，冒着红光，却没有烧伤他的手。有人低声说，那是仙术。",
        "海雾里突然亮起一道白光。一艘铁做的船，从雾后开了出来。",
        "他忽然变得很激动，翻过栏杆就要跳下海。我快拉不住他了。",
        "我知道拉不住他了，便把船牌塞进他手里。至少让他记得，我真的存在过。",
        "铁船上的人把他拖了上去。雾随即合拢，我再也看不见他的脸。",
        "在那之后，我们继续出发，看见海面尽头有一座灯火之城。",
        "第二天清晨，海雾终于散了。有人跪下来，喊出了蓬莱。",
      ]),
    },
  },
  {
    id: DOUBLE_FISH_JADE_ID,
    title: "罗布泊的第二次日落",
    kicker: "红色特殊事件 · 罗布泊旧航片",
    summary: "一张旧航片把你带进罗布泊。那里有一座只运行了四十三天的气象站，也有两次落日和两个无法辨认真假的同伴。",
    ending: "回程玻璃里多出一道人影。没有人回头。",
    entryMode: "forced",
    outcome: "resume",
    triggerTitle: "不存在的气象站",
    triggerPremise: "遥感课上，你在1980年的罗布泊航拍图里发现了一座气象站。今天的地图上，那里只有空白。",
    triggerLead: "档案的最后一页只写了一句：今天，我们看见太阳落下了两次。",
    entryLabel: "对照旧航片",
    completionLabel: "收起双鱼玉佩",
    resumeMessage: "你回到了原来的人生。此后每次日落，你都会先看一眼身后的影子。",
    requiredTalentId: DOUBLE_FISH_TALENT_ID,
    prologueEventIds: SPECIAL_PROLOGUE_EVENT_IDS.doubleFish,
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.doubleFish,
    triggerAge: DOUBLE_FISH_EVENT_AGE,
    sourceEventIds: [DOUBLE_FISH_EVENT_ID],
    pages: talePages("double-fish-jade", DOUBLE_FISH_TEXTS),
  },
  {
    id: CTHULHU_CEMETERY_ID,
    title: "七千米深处的鲸骨走廊",
    kicker: "红色特殊事件 · 七千米深潜母带",
    summary: "跨越五百三十万年的鲸骨朝向同一条海沟。你随潜器下潜，终于看见它们共同避开的东西。",
    ending: "海面恢复平静。潜器下方的圆影没有离开。",
    entryMode: "forced",
    outcome: "resume",
    triggerTitle: "鲸骨朝向哪里",
    triggerPremise: "你重新整理一组深潜影像，发现不同时代的鲸骨以相同角度指向海沟。洋流解释不了这件事。",
    triggerLead: "两个月后，你坐进载人潜器。舱门合拢，海上的声音随之消失。",
    entryLabel: "随潜器下沉",
    completionLabel: "封存最后一帧",
    resumeMessage: "你回到实验室。那段低鸣偶尔仍会从没有接通的耳机里响起。",
    requiredTalentId: CTHULHU_CEMETERY_TALENT_ID,
    prologueEventIds: SPECIAL_PROLOGUE_EVENT_IDS.cthulhuCemetery,
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.cthulhuCemetery,
    triggerAgeRange: [CTHULHU_CEMETERY_MIN_AGE, CTHULHU_CEMETERY_MAX_AGE],
    sourceEventIds: [CTHULHU_CEMETERY_EVENT_ID],
    pages: talePages("cthulhu-cemetery", CTHULHU_CEMETERY_TEXTS),
  },
  {
    id: KUNLUN_BONES_ID,
    title: "昆仑骸骨",
    kicker: "红色特殊事件 · 无编号旧磁带",
    summary: "一盘1983年的录音把你带进黑石沟。那里所有骸骨都朝向同一个洞口，失踪者留下的声音却来自洞外。",
    ending: "油纸地图再次出现。新路线的终点，是你的房间。",
    entryMode: "forced",
    outcome: "resume",
    triggerTitle: "骸骨面对的方向",
    triggerPremise: "旧磁带里，一名失踪队员反复警告：不要顺着骸骨面对的方向走。",
    triggerLead: "你摊开地图。原本空白的黑石沟里，慢慢渗出一条新的红线。",
    entryLabel: "沿红线进山",
    completionLabel: "关掉录音机",
    resumeMessage: "你离开昆仑，人生继续。那盘没有电池的磁带，却始终没有停止转动。",
    requiredTalentId: KUNLUN_BONES_TALENT_ID,
    prologueEventIds: SPECIAL_PROLOGUE_EVENT_IDS.kunlunBones,
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.kunlunBones,
    triggerAgeRange: [KUNLUN_BONES_MIN_AGE, KUNLUN_BONES_MAX_AGE],
    sourceEventIds: [KUNLUN_BONES_EVENT_ID],
    pages: talePages("kunlun-bones", KUNLUN_BONES_TEXTS),
  },
  {
    id: SAND_SEA_ID,
    title: "沙海之下",
    kicker: "红色特殊事件 · 沙海石印",
    summary: "一组卫星噪点把你带进无人沙漠。那里埋着没有尸骨的地下城市、仍在流动的水渠，以及一条不断通向更深处的路。",
    ending: "返航途中，云团挡在前方。地下那句话仍没有答案：我们自然会回来。",
    entryMode: "forced",
    outcome: "resume",
    triggerTitle: "沙下的街道",
    triggerPremise: "你在一次普通的卫星扫描中，看见无人沙漠下排列着过分整齐的线条。复测三次，城市轮廓仍在原处。",
    triggerLead: "数周后，第一组地面雷达数据传回。沙层以下，不只有一座城市。",
    entryLabel: "带队进入无人沙漠",
    completionLabel: "封存最后一次扫描",
    resumeMessage: "你回到原来的人生。那枚石印仍留在桌上，细沙偶尔会从无人触碰的刻痕里落下。",
    requiredTalentId: SAND_SEA_TALENT_ID,
    prologueEventIds: SPECIAL_PROLOGUE_EVENT_IDS.sandSea,
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.sandSea,
    triggerAgeRange: [SAND_SEA_MIN_AGE, SAND_SEA_MAX_AGE],
    sourceEventIds: [SAND_SEA_EVENT_ID],
    pages: [
      ...talePages("sand-sea/episode-1", SAND_SEA_EPISODE_ONE_TEXTS),
      ...talePages("sand-sea/episode-2", SAND_SEA_EPISODE_TWO_TEXTS),
      ...talePages("sand-sea/episode-3", SAND_SEA_EPISODE_THREE_TEXTS),
    ],
  },
  {
    id: EIGHT_FOOT_WOMAN_ID,
    title: "八尺之外",
    kicker: "紫色恐怖事件 · 招阴体质",
    summary: "你只是回乡下老宅住几天。大巴上的黑衣女人，却在那之后一次次出现在窗外。",
    ending: "她并没有跟着你回家。她只是让你替她找到了那扇门。",
    entryMode: "forced",
    outcome: "end-life",
    triggerTitle: "车厢里站着的人",
    triggerPremise: "大二暑假，你独自回乡。大巴驶进山区后，一个全身黑衣的女人始终站在过道里。",
    triggerLead: "她比任何乘客都高。车顶很低，她却没有弯腰。",
    entryLabel: "再看她一眼",
    completionLabel: "关上那扇门",
    requiredTalentId: EIGHT_FOOT_WOMAN_TALENT_ID,
    prologueEventIds: SPECIAL_PROLOGUE_EVENT_IDS.eightFootWoman,
    rumorEventId: SPECIAL_RUMOR_EVENT_IDS.eightFootWoman,
    triggerAgeRange: [EIGHT_FOOT_WOMAN_MIN_AGE, EIGHT_FOOT_WOMAN_MAX_AGE],
    sourceEventIds: [EIGHT_FOOT_WOMAN_EVENT_ID],
    pages: talePages("eight-foot-woman", EIGHT_FOOT_WOMAN_TEXTS),
  },
];

export const UNLOADED_HOMETOWN = SPECIAL_ENDINGS[0];
export const SHAMBHALA_WORLD = SPECIAL_ENDINGS[1];
export const EIGHTIES_ROOM = SPECIAL_ENDINGS[2];
export const GONGGONG_ZHURONG = SPECIAL_ENDINGS[3];
export const PENGLAI_ROUTE = SPECIAL_ENDINGS[4];
export const DOUBLE_FISH_JADE = SPECIAL_ENDINGS[5];
export const CTHULHU_CEMETERY = SPECIAL_ENDINGS[6];
export const KUNLUN_BONES = SPECIAL_ENDINGS[7];
export const SAND_SEA = SPECIAL_ENDINGS[8];
export const EIGHT_FOOT_WOMAN = SPECIAL_ENDINGS[9];

export function specialEndingTriggerAge(ending: SpecialEnding, random = Math.random) {
  if (ending.triggerAge !== undefined) return ending.triggerAge;
  if (!ending.triggerAgeRange) return 0;
  const [minimum, maximum] = ending.triggerAgeRange;
  const unit = Math.min(0.999999999, Math.max(0, random()));
  return minimum + Math.floor(unit * (maximum - minimum + 1));
}

export function findSpecialEndingBySource(eventIds: readonly RemakeId[]) {
  const seen = new Set(eventIds.map(String));
  return SPECIAL_ENDINGS.find((ending) => ending.sourceEventIds.some((id) => seen.has(String(id)))) ?? null;
}

export function scheduledSpecialEndings(talentIds: readonly RemakeId[]) {
  const selected = new Set(talentIds.map(String));
  return SPECIAL_ENDINGS.filter(
    (ending) => ending.requiredTalentId && selected.has(String(ending.requiredTalentId)),
  );
}

export function scheduledSpecialEvents(talentIds: readonly RemakeId[], random = Math.random) {
  const selected = new Set(talentIds.map(String));
  const events: Array<{ id: RemakeId; age: number }> = [];
  const occupiedAges = new Set<number>();

  for (const ending of scheduledSpecialEndings(talentIds)) {
    const targetAge = specialEndingTriggerAge(ending, random);
    const prologueAges = [Math.max(6, targetAge - 6), Math.max(7, targetAge - 2)];
    ending.prologueEventIds?.forEach((id, index) => {
      let age = prologueAges[index] ?? Math.max(6, targetAge - 1);
      while (occupiedAges.has(age) && age > 1) age -= 1;
      occupiedAges.add(age);
      events.push({ id, age });
    });
    occupiedAges.add(targetAge);
    events.push({ id: ending.sourceEventIds[0], age: targetAge });
  }

  const rumorCandidates = SPECIAL_ENDINGS
    .filter((ending) => (
      ending.rumorEventId
      && (!ending.requiredTalentId || !selected.has(String(ending.requiredTalentId)))
    ))
    .map((ending) => ending.rumorEventId as RemakeId);
  const rumorAges = [12 + Math.floor(Math.min(0.999999999, Math.max(0, random())) * 6), 27 + Math.floor(Math.min(0.999999999, Math.max(0, random())) * 10)];
  for (const preferredAge of rumorAges) {
    if (!rumorCandidates.length) break;
    const index = Math.floor(Math.min(0.999999999, Math.max(0, random())) * rumorCandidates.length);
    const [id] = rumorCandidates.splice(index, 1);
    let age = preferredAge;
    while (occupiedAges.has(age)) age += 1;
    occupiedAges.add(age);
    events.push({ id, age });
  }

  if (
    selected.has(GONGGONG_BLOODLINE_TALENT_ID)
    || selected.has("site-red-pill")
    || selected.has(PENGLAI_TALENT_ID)
    || selected.has(DOUBLE_FISH_TALENT_ID)
    || selected.has(CTHULHU_CEMETERY_TALENT_ID)
    || selected.has(KUNLUN_BONES_TALENT_ID)
    || selected.has(SAND_SEA_TALENT_ID)
    || selected.has(EIGHT_FOOT_WOMAN_TALENT_ID)
  ) {
    events.push({ id: MALE_BIRTH_EVENT_ID, age: 0 });
  }
  return events.sort((left, right) => left.age - right.age);
}

export function hasSpecialEndingSource(eventIds: readonly RemakeId[]) {
  return Boolean(findSpecialEndingBySource(eventIds));
}
