import type { Item } from "./schema";

export const KAKAO_STORY_KEY = "foundphone-story:ui-test-phone-v2:kakao-live";
export type KakaoStoryState = { index: number; shown: number; nextAt: number; started: boolean };
export type KakaoStoryEntry = { sender: "me" | "mom"; time: string; body: string; image?: boolean };
export const kakaoStoryGroups: KakaoStoryEntry[][] = [
  [{ sender:"me",time:"13:15",body:"发尾是你吧，妈妈" }],
  [
    { sender:"me",time:"14:20",body:"你已读了" },
    { sender:"me",time:"14:20",body:"我认为这是肯定回答" },
    { sender:"me",time:"14:20",body:"所以那件黑色蕾丝内衣是你的" },
    { sender:"me",time:"14:20",body:"真漂亮" },
    { sender:"mom",time:"14:25",body:"够了" },
    { sender:"mom",time:"14:25",body:"西村力" },
    { sender:"mom",time:"14:25",body:"别再说了" },
    { sender:"mom",time:"14:25",body:"…一点都不" },
    { sender:"mom",time:"14:25",body:"你看到了照片，很奇怪吧？我穿上去的样子" },
    { sender:"mom",time:"14:25",body:"还有我对你" },
    { sender:"mom",time:"14:25",body:".." },
    { sender:"mom",time:"14:25",body:"是啊，是那样的爱，母子的爱和恋人的爱…已经分不开了" },
    { sender:"mom",time:"14:25",body:"不管你要骂我什么，我都认" },
    { sender:"mom",time:"14:25",body:"对不起，抱歉" },
  ],
  [
    { sender:"me",time:"14:28",body:"我是来兴师问罪的" },
    { sender:"me",time:"14:28",body:"可妈妈先委屈了" },
    { sender:"me",time:"14:28",body:"我没有觉得恶心、那句真漂亮是真心的" },
    { sender:"me",time:"14:28",body:"空杯的样子真的很可爱" },
    { sender:"me",time:"14:28",body:"我猜你会哭，妈妈，现在尽量忍耐着吧" },
    { sender:"me",time:"14:28",body:"我等妈妈回家，眼泪要到我的怀里流，我才能帮你擦掉" },
  ],
  [
    { sender:"me",time:"14:46",body:"我爱你，妈妈，朴综星，我爱你" },
    { sender:"me",time:"14:46",body:"我爱你，像你爱着我的感情那般" },
    { sender:"me",time:"14:46",body:"按照普世意义的定义，母子确实不可以又做恋人" },
    { sender:"me",time:"14:46",body:"不过谁会忍心谴责我们？就算有、那又怎样？" },
    { sender:"me",time:"14:46",body:"上帝、或者神、还是这个社会，总会包容一些不那么普通的存在" },
    { sender:"me",time:"14:46",body:"但在我们的关系里，没有什么是畸形的，真正不普通的东西是我们之间的爱，太真挚太强烈" },
    { sender:"mom",time:"15:01",body:"…" },
    { sender:"mom",time:"15:01",body:"我已经不能再说出任何拒绝你的话了" },
    { sender:"mom",time:"15:01",body:"不管是现在、还是当面，我都不能再将你推开" },
    { sender:"mom",time:"15:01",body:"接电话，好不好？" },
    { sender:"mom",time:"15:01",body:"我想听你的声音" },
    { sender:"mom",time:"15:01",body:"niki" },
    { sender:"mom",time:"15:01",body:"我也好想你" },
    { sender:"mom",time:"17:02",body:"通话时长2:01:15" },
  ],
  [
    { sender:"me",time:"17:02",body:"看看脸" },
    { sender:"me",time:"17:02",body:"哭肿没有" },
    { sender:"mom",time:"17:04",body:"（一张照片）",image:true },
  ],
  [
    { sender:"me",time:"17:07",body:"可怜" },
    { sender:"me",time:"17:07",body:"需要我把妈妈的眼泪亲干净" },
    { sender:"me",time:"17:07",body:"我去接你" },
  ],
];
export const emptyKakaoStory = (): KakaoStoryState => ({index:0,shown:0,nextAt:0,started:false});
export function readKakaoStory(): KakaoStoryState {
  try {
    const raw = localStorage.getItem(KAKAO_STORY_KEY);
    if (raw) {
      const s = JSON.parse(raw) as KakaoStoryState;
      if (Number.isInteger(s.index) && s.index >= 0 && s.index <= kakaoStoryGroups.length && Number.isInteger(s.shown) && s.shown >= 0) return s;
    }
  } catch { /* storage unavailable */ }
  return emptyKakaoStory();
}
export function writeKakaoStory(state: KakaoStoryState) {
  try { localStorage.setItem(KAKAO_STORY_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event("foundphone-kakao-story-change"));
}
export function kakaoStoryMessages(state: KakaoStoryState, today: string): Item[] {
  return kakaoStoryGroups.flatMap((group, groupIndex) => group
    .slice(0, groupIndex < state.index ? group.length : groupIndex === state.index ? state.shown : 0)
    .map((entry, i) => ({
      id:`kakao-live-${groupIndex}-${i}`,
      app:"kakao",
      title:"妈妈",
      body:entry.body,
      time:`${today} ${entry.time}`,
      sender:entry.sender === "me" ? "NIKI" : "妈妈",
      outgoing:entry.sender === "me",
      avatar:"",
      kind:"message",
      folder:"",
      tags:[],
      meta: entry.image ? { imageText:entry.body, scripted:"true" } : { scripted:"true" },
    } as unknown as Item)));
}
