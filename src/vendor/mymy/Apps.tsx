/* React/data adapters for dudwo5/Mymy UI templates: kt/ktn/KHD/bub,
 * igHome/igProfile/igDM/igSheet, xHome. See NOTICE.txt for permission.
 * Author content, DOM globals, timers and media dependencies are excluded. */
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Settings,
  Users,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Home,
  Grid,
  Send,
  Bookmark,
  Repeat2,
  BarChart2,
  Share,
  User,
  Bell,
  X,
  Smile,
  Menu,
  Compass,
  LockKeyhole,
} from "lucide-react";
import type { SkinProps } from "../../AppSkins";
import { Avatar, Media } from "../../skins/shared";
import { useSkinState } from "../../skinState";
import { makeItem, type Item } from "../../schema";
import "./ui.css";
import "./adapter.css";
function grouped(items: Item[]) {
  return [...new Set(items.map((i) => i.title))].map((title) => ({
    title,
    items: items.filter((i) => i.title === title),
  }));
}
export function messageRun(items: Item[], index: number) {
  const m = items[index],
    previous = items[index - 1],
    next = items[index + 1];
  return {
    first:
      !previous ||
      previous.outgoing !== m.outgoing ||
      previous.sender !== m.sender,
    last: !next || next.outgoing !== m.outgoing || next.sender !== m.sender,
  };
}
const read = (p: SkinProps, i: Item) =>
  p.creator || i.password ? p.onItem(i) : p.onRead(i.id);
function Blank() {
  return <p className="mymy-empty">暂无内容</p>;
}
function Back({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="返回" onClick={onClick}>
      <ArrowLeft size={22} />
    </button>
  );
}
export function MymyKakao(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "聊天"),
    [sent, setSent] = useSkinState<string[]>(p, "mymyKktSent", []),
    [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false);
  const list = grouped(p.items),
    blockedThreads = new Set(p.items.filter((i) => i.meta.blockedConversation === "true").map((i) => i.title)),
    messages = [
      ...p.items.filter((i) => i.title === p.thread),
      ...sent.flatMap((raw, index) => {
        try {
          const entry: unknown = JSON.parse(raw);
          if (
            !Array.isArray(entry) ||
            entry.length !== 3 ||
            !entry.every((v) => typeof v === "string") ||
            entry[0] !== p.thread
          )
            return [];
          return [
            makeItem({
              id: "local-kkt-" + index,
              title: entry[0],
              body: entry[1],
              time: entry[2],
              sender: p.owner || "机主",
              outgoing: true,
              meta: { local: "true" },
            }),
          ];
        } catch {
          return [];
        }
      }),
    ],
    scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [p.thread, messages.length]);
  return (
    <div className="mymy-ui mymy-kakao" data-mymy="kakao">
      {p.thread ? (
        <>
          <header className="kzth">
            <Back onClick={() => p.onThread("")} />
            <span className="kzname">{p.thread}</span>
            <span className="kzpill">
              <button aria-label="聊天菜单" onClick={() => setMenu(!menu)}>
                <Menu size={21} />
              </button>
            </span>
          </header>
          <div className="msgs kk" ref={scroll}>
            {messages.map((m, i) => {
              const previous = messages[i - 1];
              const day = m.time.slice(0, 10);
              const previousDay = previous?.time.slice(0, 10);
              const gapMinutes = previous && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(m.time) && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(previous.time)
                ? (Date.parse(m.time.replace(" ", "T")) - Date.parse(previous.time.replace(" ", "T"))) / 60000
                : 0;
              const newGroup = !previous || previousDay !== day || gapMinutes >= 10;
              const run = messageRun(messages, i);
              const next = messages[i + 1];
              const nextGapMinutes = next && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(next.time) && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(m.time)
                ? (Date.parse(next.time.replace(" ", "T")) - Date.parse(m.time.replace(" ", "T"))) / 60000
                : 0;
              const last = run.last || !next || next.time.slice(0, 10) !== day || nextGapMinutes >= 10;
              const first = newGroup || run.first;
              return (
                <div
                  key={m.id}
                  className={
                    "kzm " +
                    (m.outgoing ? "kzmy" : "kzot") +
                    (first ? " first" : "") +
                    (newGroup ? " kz-time-gap" : "")
                  }
                >
                  {first && day !== previousDay && /^\d{4}-\d{2}-\d{2}$/.test(day) && (
                    <div className="kz-date-divider">{day.replaceAll("-", ".")}</div>
                  )}
                  {!m.outgoing && first && (
                    <>
                      <div className="kzmav">
                        <Avatar name={m.sender} src={m.avatar} />
                      </div>
                      <div className="kzmn">{m.sender}</div>
                    </>
                  )}
                  {m.outgoing && last && (
                    <span className="kzt">
                      {m.meta.unread || ""}
                      <br />
                      {m.time.slice(-5)}
                    </span>
                  )}
                  <button
                    className={"kzbub" + (m.media ? " kzimg" : "")}
                    onClick={() => m.meta.local !== "true" && read(p, m)}
                  >
                    {m.media ? <Media item={m} /> : m.body}
                  </button>
                  {!m.outgoing && last && (
                    <span className="kzt">{m.time.slice(-5)}</span>
                  )}
                </div>
              );
            })}
            {blockedThreads.has(p.thread) && <div className="kakao-blocked-notice">您已拉黑该用户。</div>}
            {!messages.length && <Blank />}
          </div>
          {!blockedThreads.has(p.thread) && <form
            className="kzinp"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) {
                setSent([
                  ...sent,
                  JSON.stringify([
                    p.thread,
                    draft.trim(),
                    p.virtualTime || "09:41",
                  ]),
                ]);
                setDraft("");
              }
            }}
          >
            <button
              type="button"
              aria-label="添加聊天内容"
              onClick={() => (p.creator ? p.onAdd() : setMenu(!menu))}
            >
              <Plus size={21} />
            </button>
            <input
              aria-label="KKT消息"
              placeholder="输入消息"
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Smile size={22} />
            <button
              className={draft.trim() ? "go" : ""}
              aria-label="发送KKT消息"
              disabled={!draft.trim()}
            >
              ↑
            </button>
          </form>}
          {menu && (
            <div className="mymy-local-menu">
              <strong>{p.thread}</strong>
              <p>
                群成员：{[...new Set(messages.map((m) => m.sender))].join("、")}
              </p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </>
      ) : (
        <div className="kzkk">
          <div className="kzhd">
            <header className="kzkh">
              <b className="kzti">
                {tab === "好友" ? p.owner || "好友" : "聊天"}
              </b>
              <span className="kzic">
                <button
                  aria-label="搜索聊天"
                  onClick={() => setQuery(query ? "" : " ")}
                >
                  <Search size={21} />
                </button>
                {p.creator && (
                  <button aria-label="新增内容" onClick={p.onAdd}>
                    <Plus />
                  </button>
                )}
                <button aria-label="KKT设置" onClick={() => setMenu(!menu)}>
                  <Settings size={21} />
                </button>
              </span>
            </header>
            <div className="kzkc2">
              {["好友", "聊天"].map((t) => (
                <button
                  key={t}
                  className={
                    "kzkpl " +
                    (t === tab || (t === "为你推荐" && tab === "推荐")
                      ? "on"
                      : "")
                  }
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {query !== "" && (
              <input
                className="mymy-search"
                aria-label="搜索KKT"
                value={query.trimStart()}
                onChange={(e) => setQuery(e.target.value || " ")}
                placeholder="搜索"
              />
            )}
          </div>
          <div className="kzkb">
            <div className="kzksec">
              {tab === "好友" ? "好友" : "全部聊天"} {tab === "好友" ? list.filter((g) => !blockedThreads.has(g.title)).length : list.length}
            </div>
            {list
              .filter((g) => (tab !== "好友" || !blockedThreads.has(g.title)) && g.title.includes(query.trim()))
              .map((g) => {
                const last = g.items.at(-1)!;
                return (
                  <button
                    className="kzkr kzkcr"
                    key={g.title}
                    onClick={() => p.onThread(g.title)}
                  >
                    <Avatar
                      name={g.title}
                      src={g.items.find((item) => !item.outgoing && item.avatar)?.avatar || last.avatar}
                    />
                    <span className="kzkn">
                      <b>{g.title}</b>
                      {tab !== "好友" && <small>{last.body}</small>}
                    </span>
                    <span className="kzkmt">
                      {last.time.slice(-5)}
                      {last.meta.unread && (
                        <i className="kzkbd">{last.meta.unread}</i>
                      )}
                    </span>
                  </button>
                );
              })}
            {!list.length && <Blank />}
          </div>
          <nav className="kzknv">
            {[Users, MessageCircle, Compass, Grid, MoreHorizontal].map(
              (Icon, i) => (
                <button
                  key={i}
                  aria-label={["好友", "聊天", "发现", "更多功能", "设置"][i]}
                  className={(tab === "好友" ? 0 : 1) === i ? "on" : ""}
                  onClick={() =>
                    i < 2 ? setTab(["好友", "聊天"][i]) : setMenu(true)
                  }
                >
                  <Icon />
                </button>
              ),
            )}
          </nav>
          {menu && (
            <div className="mymy-local-menu">
              <strong>KakaoTalk</strong>
              <p>作品内聊天</p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function MymyInstagram(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "主页"),
    [liked, setLiked] = useSkinState<string[]>(p, "mymyLiked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "mymySaved", []),
    [replies, setReplies] = useSkinState<string[]>(p, "mymyReplies", []),
    [seen, setSeen] = useSkinState<string[]>(p, "mymySeen", []);
  const [sheet, setSheet] = useState<Item | null>(null),
    [selected, setSelected] = useState<Item | null>(null),
    [story, setStory] = useState(0),
    [draft, setDraft] = useState(""),
    [pop, setPop] = useState("");
  const posts = p.items.filter(
      (i) => i.folder !== "私信" && i.meta.story !== "true",
    ),
    stories = p.items.filter((i) => i.meta.story === "true"),
    dms = p.items.filter((i) => i.folder === "私信"),
    active = stories[story - 1];
  const toggle = (id: string, values: string[], set: (v: string[]) => void) =>
    set(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(
      () => setStory((n) => (n < stories.length ? n + 1 : 0)),
      5000,
    );
    return () => clearTimeout(t);
  }, [active, stories.length]);
  const openStory = (i: number) => {
    const m = stories[i];
    setSeen([...new Set([...seen, m.id])]);
    read(p, m);
    setStory(i + 1);
  };
  const openPost = (i: Item) => {
    if (p.creator || i.password) p.onItem(i);
    else {
      read(p, i);
      setSelected(i);
    }
  };
  const post = (i: Item) => (
    <article className="igp" key={i.id}>
      <header className="igph">
        <Avatar name={i.sender} src={i.avatar} />
        <div className="igpn">
          <button onClick={() => setTab("个人主页")}>
            <b>{i.sender}</b>
          </button>
          <small>{i.meta.location || i.time}</small>
        </div>
        <button aria-label="帖子详情" onClick={() => openPost(i)}>
          <MoreHorizontal />
        </button>
      </header>
      <div
        className="carw"
        onDoubleClick={() => {
          if (!liked.includes(i.id)) setLiked([...liked, i.id]);
          setPop(i.id);
        }}
      >
        <Media item={i} />
        {pop === i.id && (
          <Heart
            className="mymy-heart-pop"
            fill="white"
            onAnimationEnd={() => setPop("")}
          />
        )}
      </div>
      <div className="iga">
        <button
          aria-label={"点赞" + i.title}
          aria-pressed={liked.includes(i.id)}
          onClick={() => toggle(i.id, liked, setLiked)}
        >
          <Heart
            fill={liked.includes(i.id) ? "#ff3040" : "none"}
            color={liked.includes(i.id) ? "#ff3040" : "currentColor"}
          />
        </button>
        <button
          aria-label={"评论" + i.title}
          onClick={() => {
            read(p, i);
            setSheet(i);
          }}
        >
          <MessageCircle />
        </button>
        <button aria-label="分享帖子" onClick={() => setTab("私信")}>
          <Send />
        </button>
        <button
          className="mymy-save"
          aria-label={"收藏" + i.title}
          aria-pressed={saved.includes(i.id)}
          onClick={() => toggle(i.id, saved, setSaved)}
        >
          <Bookmark fill={saved.includes(i.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="lk2">{i.likes + (liked.includes(i.id) ? 1 : 0)} 次赞</p>
      <button
        className="igc"
        onClick={() => {
          openPost(i);
        }}
      >
        <b>{i.sender}</b> {i.body}
      </button>
      <button className="cmall" onClick={() => setSheet(i)}>
        查看评论{" "}
        {i.comments.length +
          replies.filter((r) => r.startsWith(i.id + "\t")).length}
      </button>
      <p className="igt">{i.time}</p>
    </article>
  );
  return (
    <div className="mymy-ui mymy-instagram" data-mymy="instagram">
      <div className="ig">
        <header className="igh">
          <button
            aria-label={selected ? "返回Instagram动态" : "关闭当前App"}
            onClick={() => (selected ? setSelected(null) : p.onBack())}
          >
            <ArrowLeft />
          </button>
          <span className="igl2">
            {selected ? "帖子" : tab === "主页" ? "Instagram" : tab}
          </span>
          <button aria-label="打开私信" onClick={() => setTab("私信")}>
            <Send />
          </button>
        </header>
        <div className="igb">
          {selected && post(selected)}
          {!selected && tab === "主页" && (
            <>
              <div className="sts">
                {stories.map((s, n) => (
                  <button
                    className="st"
                    key={s.id}
                    onClick={() => openStory(n)}
                  >
                    <span
                      className={"sr on " + (seen.includes(s.id) ? "seen" : "")}
                    >
                      <Avatar name={s.sender} src={s.avatar} />
                    </span>
                    <small>{s.sender}</small>
                  </button>
                ))}
              </div>
              {posts.map(post)}
              {!posts.length && <Blank />}
            </>
          )}
          {!selected && tab === "个人主页" && (
            <>
              <div className="pf">
                <Avatar name={p.owner || "机主"} />
                <div className="ps">
                  <div>
                    <b>{posts.length}</b>
                    <small>帖子</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>粉丝</small>
                  </div>
                  <div>
                    <b>—</b>
                    <small>关注</small>
                  </div>
                </div>
              </div>
              <p className="pn">{p.owner}</p>
              <div className="ptab">
                <div className="on">
                  <Grid />
                </div>
              </div>
              <div className="pg2">
                {posts.map((i) => (
                  <button key={i.id} onClick={() => openPost(i)}>
                    <Media item={i} />
                  </button>
                ))}
              </div>
            </>
          )}
          {!selected && tab === "私信" && (
            <>
              {dms.map((i) => (
                <button className="kzkr" key={i.id} onClick={() => openPost(i)}>
                  <Avatar name={i.sender} src={i.avatar} />
                  <span className="kzkn">
                    <b>{i.title}</b>
                    <small>{i.body}</small>
                  </span>
                </button>
              ))}
              {!dms.length && <Blank />}
            </>
          )}
          {!selected && tab === "搜索" && (
            <>
              <input
                className="mymy-search"
                aria-label="搜索Instagram"
                placeholder="搜索"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              {posts
                .filter((i) => (i.title + i.body + i.sender).includes(draft))
                .map(post)}
            </>
          )}
        </div>
        <nav className="mymy-ig-nav">
          {[Home, Search, Send, User].map((Icon, n) => (
            <button
              key={n}
              aria-label={["主页", "搜索", "私信", "个人主页"][n]}
              aria-pressed={
                !selected && tab === ["主页", "搜索", "私信", "个人主页"][n]
              }
              onClick={() => {
                setSelected(null);
                setTab(["主页", "搜索", "私信", "个人主页"][n]);
              }}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
      {sheet && (
        <div className="kzcs">
          <button
            className="kzbk"
            aria-label="关闭评论"
            onClick={() => setSheet(null)}
          />
          <section className="kzsh" role="dialog" aria-label="Instagram评论">
            <div className="mymy-sheet-handle" />
            <header>
              <b>评论</b>
              <button aria-label="关闭评论面板" onClick={() => setSheet(null)}>
                <X />
              </button>
            </header>
            <div className="mymy-comments">
              {[
                ...sheet.comments,
                ...replies
                  .filter((r) => r.startsWith(sheet.id + "\t"))
                  .map((r) => r.split("\t").slice(1).join("\t")),
              ].map((c, n) => (
                <p key={n}>
                  <Avatar name={c.split(":")[0]} />
                  {c}
                </p>
              ))}
            </div>
            <form
              className="cmb2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, sheet.id + "\t" + draft.trim()]);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="添加评论"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="添加评论"
                maxLength={500}
              />
              <button>发布</button>
            </form>
          </section>
        </div>
      )}
      {active && (
        <div
          className="mymy-story"
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const next =
              e.clientX - box.left < box.width * 0.3 ? story - 1 : story + 1;
            setStory(next > stories.length ? 0 : Math.max(0, next));
          }}
        >
          <div className="mymy-story-bars">
            {stories.map((s, n) => (
              <i key={s.id} className={n < story ? "seen" : ""} />
            ))}
          </div>
          <header>
            <Avatar name={active.sender} src={active.avatar} />
            <b>{active.sender}</b>
            <button
              aria-label="关闭快拍"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setStory(0)}
            >
              <X />
            </button>
          </header>
          <Media item={active} />
          <p>{active.body}</p>
        </div>
      )}
    </div>
  );
}
export function MymyX(p: SkinProps) {
  const [dark, setDark] = useSkinState<boolean>(p, "x-dark", true);
  const [profile, setProfile] = useState<"fawei" | "niki" | null>(null);
  const faweiUnlockKey = "foundphone-story:ui-test-phone-v2:x-fawei-unlocked";
  const [faweiUnlocked, setFaweiUnlocked] = useState(() => {
    try { return localStorage.getItem(faweiUnlockKey) === "true"; } catch { return false; }
  });
  const [faweiAnswer, setFaweiAnswer] = useState("");
  const [faweiError, setFaweiError] = useState(false);
  const [nikiAvatar, setNikiAvatar] = useState(() => {
    try { return localStorage.getItem("foundphone-x-niki-avatar-v2") || ""; } catch { return ""; }
  });
  const nikiDefaultAvatar = "https://raw.githubusercontent.com/chunwei233/FoundPhone-Studio/main/%E8%A5%BF%E6%9D%91%E5%8A%9B%E6%8E%A8%E7%89%B9.jpg";
  const faweiAvatar = "https://raw.githubusercontent.com/chunwei233/FoundPhone-Studio/main/%E6%9C%B4%E7%BB%BC%E6%98%9F%E6%8E%A8%E7%89%B9.jpg";
  const openAuthor = (handle: string) => {
    if (handle === "nandj4mylove") { setFaweiAnswer(""); setFaweiError(false); setProfile("fawei"); }
    else if (handle === "nsmommyissues") setProfile("niki");
  };
  const setAvatarFromFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      try { localStorage.setItem("foundphone-x-niki-avatar-v2", reader.result); } catch { /* browser storage may be full */ }
      setNikiAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "推荐"),
    [likes, setLikes] = useSkinState<string[]>(p, "mymyXLikes", []),
    [reposts, setReposts] = useSkinState<string[]>(p, "mymyXReposts", []),
    [marks, setMarks] = useSkinState<string[]>(p, "mymyXMarks", []),
    [query, setQuery] = useState("");
  const isLiked = (id: string) =>
    typeof p.ui?.["liked-" + id] === "boolean"
      ? Boolean(p.ui["liked-" + id])
      : likes.includes(id);
  const isSaved = (id: string) =>
    typeof p.ui?.["saved-" + id] === "boolean"
      ? Boolean(p.ui["saved-" + id])
      : marks.includes(id);
  const toggle = (id: string, v: string[], set: (x: string[]) => void) =>
    set(v.includes(id) ? v.filter((x) => x !== id) : [...v, id]);
  return (
    <div
      className={"mymy-ui mymy-x " + (dark ? "x-reference-dark" : "")}
      data-mymy="twitter"
    >
      <div className="kzxw">
        <header className="kzxh">
          <button aria-label={profile ? "返回推荐" : "关闭当前App"} onClick={() => profile ? setProfile(null) : p.onBack()}>
            <ArrowLeft />
          </button>
          <div className="kzxlg">{profile ? "个人主页" : "𝕏"}</div>
          {!profile && <div className="x-header-actions">
            <button aria-label="切换X外观" onClick={() => setDark(!dark)}><User /></button>
            <button className="x-own-profile" aria-label="查看NIKI的X主页" onClick={() => setProfile("niki")}>
              <img src={nikiAvatar || nikiDefaultAvatar} alt="NIKI" />
            </button>
          </div>}
        </header>
        {!profile && <div className="kzxtb">
          {["为你推荐", "正在关注", "添加 +", "时间"].map((t) => (
            <button
              className={t === tab ? "on" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>}
        {profile && (
          <div className="x-profile-scroll">
            <div className="x-profile-banner" />
            <div className="x-profile-identity">
              <div className="x-profile-avatar">
                {profile === "niki" ? <img src={nikiAvatar || nikiDefaultAvatar} alt="NIKI头像" /> : <img src={faweiAvatar} alt="发尾头像" />}
              </div>
              {profile === "niki" && <label className="x-avatar-picker">更换头像<input type="file" accept="image/*" onChange={(e) => setAvatarFromFile(e.target.files?.[0])} /></label>}
              <h2>{profile === "niki" ? "鹤顶红" : "发尾"}</h2>
              <p className="x-profile-handle">@{profile === "niki" ? "nsmommyissues" : "nandj4mylove"}</p>
              {profile === "niki" && <p className="x-profile-owner">NIKI · 机主</p>}
              {profile === "fawei" && !faweiUnlocked ? (
                <div className="x-private-profile-lock">
                  <LockKeyhole size={30} />
                  <strong>此账号已设为私密</strong>
                  <p>问题：我的最爱</p>
                  <form onSubmit={(e) => { e.preventDefault(); if (faweiAnswer.trim().toLowerCase() === "niki") { setFaweiUnlocked(true); try { localStorage.setItem(faweiUnlockKey, "true"); } catch { /* private browsing may block persistence */ } setFaweiError(false); } else { setFaweiError(true); } }}>
                    <input aria-label="私密账号验证答案" type="text" autoComplete="off" value={faweiAnswer} onChange={(e) => { setFaweiAnswer(e.target.value); setFaweiError(false); }} placeholder="输入答案" />
                    {faweiError && <span role="alert">答案不正确，请重试</span>}
                    <button type="submit">解锁主页</button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="x-profile-tabs"><strong>推文</strong></div>
                  <div className="x-profile-posts">
                    {p.items
                      .filter((i) => i.meta.profile === profile)
                      .sort((a, b) => b.time.localeCompare(a.time))
                      .map((i) => (
                        <article className="kzxt x-profile-post" key={i.id}>
                          <div className="kzxb">
                            <div className="kzxn">
                              <div className="x-author-identity">
                                <b>{profile === "niki" ? "鹤顶红" : "发尾"}</b>
                                <small>@{profile === "niki" ? "nsmommyissues" : "nandj4mylove"} · {i.time.slice(0, 10)}</small>
                              </div>
                            </div>
                            {i.body && <div className="kzxx x-profile-post-body">{i.body}</div>}
                            {typeof i.meta.imageText === "string" && i.meta.imageText && (
                              <div className="kzxv x-text-image x-profile-text-image">
                                <span>{i.meta.imageText}</span>
                              </div>
                            )}
                            <div className="kzxac">
                              <span><MessageCircle />0</span>
                              <span><Repeat2 />0</span>
                              <span><Heart />0</span>
                              <span><BarChart2 />0</span>
                              <span><Bookmark /></span>
                              <span><Share /></span>
                            </div>
                          </div>
                        </article>
                      ))}
                    {!p.items.some((i) => i.meta.profile === profile) && <p className="x-profile-empty">暂无推文</p>}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {!profile && tab === "搜索" && (
          <input
            className="mymy-search"
            aria-label="搜索X"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索"
          />
        )}
        {!profile && <div className="kzxfd">
          {p.items
            .filter((i) => !i.meta.profile)
            .filter((i) => (i.title + i.body).includes(query))
            .map((i) => (
              <article className="kzxt" key={i.id}>
                <button className="x-author-avatar" aria-label={`查看${i.sender}的主页`} onClick={() => openAuthor(String(i.meta.handle || ""))}>
                  {i.meta.handle === "nandj4mylove" ? <img className="x-feed-avatar-photo" src={faweiAvatar} alt="发尾头像" /> : <Avatar name={i.sender} src={i.avatar} />}
                </button>
                <div className="kzxb">
                  <div className="kzxn">
                    <div className="x-author-identity">
                      <button className="x-author-name" onClick={() => openAuthor(String(i.meta.handle || ""))}><b>{i.sender}</b></button>
                      <small>@{i.meta.handle || "user"} · {i.time.slice(-5)}</small>
                    </div>
                    <em>
                      <MoreHorizontal size={18} />
                    </em>
                  </div>
                  {i.body && <button
                    className="kzxx"
                    onClick={() => {
                      read(p, i);
                      p.onItem(i);
                    }}
                  >
                    {i.body}
                  </button>}
                  {typeof i.meta.imageText === "string" && i.meta.imageText && (
                    <button className="kzxv x-text-image" aria-label="查看图片推文" onClick={() => p.onItem(i)}>
                      <span>{i.meta.imageText}</span>
                    </button>
                  )}
                  {i.media && (
                    <button
                      className="kzxv"
                      aria-label="打开媒体"
                      onClick={() => p.onItem(i)}
                    >
                      <Media item={i} />
                    </button>
                  )}
                  <div className="kzxac">
                    <button
                      aria-label={"评论" + i.title}
                      onClick={() => p.onItem(i)}
                    >
                      <MessageCircle />
                      {i.comments.length}
                    </button>
                    <button
                      aria-label={"转发" + i.title}
                      aria-pressed={reposts.includes(i.id)}
                      onClick={() => toggle(i.id, reposts, setReposts)}
                    >
                      <Repeat2 />
                      {i.meta.handle === "nandj4mylove" ? 0 : reposts.includes(i.id) ? 1 : 0}
                    </button>
                    <button
                      aria-label={"点赞" + i.title}
                      aria-pressed={isLiked(i.id)}
                      onClick={() => {
                        toggle(i.id, likes, setLikes);
                        p.onUi?.("liked-" + i.id, !isLiked(i.id));
                      }}
                    >
                      <Heart fill={isLiked(i.id) ? "#f91880" : "none"} />
                      {i.meta.handle === "nandj4mylove" ? 0 : i.likes + (isLiked(i.id) ? 1 : 0)}
                    </button>
                    <span>
                      <BarChart2 />
                      {i.meta.handle === "nandj4mylove" ? "0" : i.meta.views || "—"}
                    </span>
                    <button
                      aria-label={"收藏" + i.title}
                      aria-pressed={isSaved(i.id)}
                      onClick={() => {
                        toggle(i.id, marks, setMarks);
                        p.onUi?.("saved-" + i.id, !isSaved(i.id));
                      }}
                    >
                      <Bookmark />
                    </button>
                    <button aria-label="分享" onClick={() => p.onItem(i)}>
                      <Share />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          {!p.items.length && <Blank />}
        </div>}
        {!profile && <nav className="kzxnav">
          {[Home, Search, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={["时间线", "搜索", "通知", "私信"][n]}
              onClick={() => n < 2 && setTab(n ? "搜索" : "推荐")}
              disabled={n > 1}
            >
              <Icon />
            </button>
          ))}
        </nav>}
      </div>
    </div>
  );
}
