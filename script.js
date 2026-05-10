const app = document.querySelector("#app");
const routeLabel = document.querySelector("#routeLabel");
const nav = document.querySelector(".bottom-nav");
const fontTools = document.querySelector(".font-tools");

const state = {
  route: "start",
  onboarding: 0,
  detailPlace: "bund",
  detailTab: "overview",
  city: "上海市",
  filter: "无障碍景区",
  liked: {},
  detailLiked: {},
  expanded: {},
  switches: {
    message: true,
    email: true
  },
  voiceMode: false,
  voicePanel: false,
  listening: false,
  voicePos: {
    x: 312,
    y: 650
  },
  draggingVoice: false,
  voiceMoved: false,
  lightbox: null,
  ratings: {
    passage: 0,
    restroom: 0,
    guide: 0
  },
  reviewDraft: "",
  toast: "",
  modal: null
};

document.body.classList.add("font-clear");

const places = {
  bund: {
    title: "上海外滩 · 中山东一路49号",
    area: "上海 · 外滩",
    score: "4.5",
    distance: "1.2公里",
    type: "无障碍景区",
    cover: "./assets/scenic/bund-cover.jpg",
    desc: "外滩临近黄浦江畔，步道较宽，周边有多个无障碍入口。建议提前确认卫生间与坡道状态。"
  },
  longhua: {
    title: "徐汇区龙华路2853号",
    area: "上海 · 龙华寺",
    score: "4.5",
    distance: "1.2公里",
    type: "无障碍景区",
    cover: "./assets/scenic/longhua-cover.jpg",
    desc: "龙华寺周边交通便利，入口区域较平缓，部分历史建筑区域仍需关注台阶与人流情况。"
  }
};

const userReviews = {
  bund: {
    user: "不可思议的障碍",
    avatar: "./assets/reviews/bund-avatar.jpg",
    score: "4.5",
    time: "3 小时前发布",
    text: "这个无障碍厕所位置在外滩金融中心三楼，在彼得兔展入口不远处，无障碍标识比较清晰，厕所内空间布局合理，轮椅回转很轻松。\n无障碍坐便器两侧抓杆款式正确，美中不足的是直角抓杆安装位置过于偏前方，导致两边抓杆有点不对等，而且上翻抓杆距离坐便器边缘太远，转移身体发力有些不便。",
    images: [
      "./assets/reviews/bund-1.jpg",
      "./assets/reviews/bund-2.jpg",
      "./assets/reviews/bund-3.jpg",
      "./assets/reviews/bund-4.jpg",
      "./assets/reviews/bund-5.jpg"
    ],
    tags: "#无障碍卫生间 #外滩体验 #轮椅友好"
  },
  longhua: {
    user: "无障碍砖家",
    avatar: "./assets/reviews/longhua-avatar.jpg",
    score: "4.2",
    time: "3 小时前发布",
    text: "礼佛也好，游览也罢，龙华寺作为上海知名寺庙，一直游客如织，来这里的老人、轮椅游客或者儿童等无障碍需求人群肯定不少。龙华寺地处平坦地带，自然条件很好。不过跟很多古建景点一样，台阶还是成为了建筑不可或缺的构成因素之一，也阻挡了身体不方便的游客入内参观。院落之间还好，被赋予了金属台阶，轮椅使用者总归可以抵达，不过卫生间内就不那么规范了。不是说没有无障碍卫生间，不过对重度残疾的人士肯定是相当不好用的。",
    images: [
      "./assets/reviews/longhua-1.jpg",
      "./assets/reviews/longhua-2.jpg",
      "./assets/reviews/longhua-3.jpg",
      "./assets/reviews/longhua-4.jpg",
      "./assets/reviews/longhua-5.jpg",
      "./assets/reviews/longhua-6.jpg",
      "./assets/reviews/longhua-7.jpg",
      "./assets/reviews/longhua-8.jpg",
      "./assets/reviews/longhua-9.jpg",
      "./assets/reviews/longhua-10.jpg",
      "./assets/reviews/longhua-11.jpg",
      "./assets/reviews/longhua-12.jpg",
      "./assets/reviews/longhua-13.jpg",
      "./assets/reviews/longhua-14.jpg"
    ],
    tags: "#古建无障碍 #龙华寺 #台阶体验"
  }
};

const labels = {
  start: "启动页",
  onboarding: "引导页",
  welcome: "欢迎页",
  location: "定位权限",
  notification: "通知权限",
  home: "首页",
  map: "地图",
  detail: "景点详情",
  mission: "任务",
  profile: "我的"
};

const photoSections = [
  { key: "passage", title: "无障碍通道" },
  { key: "restroom", title: "无障碍卫生间" },
  { key: "blindPath", title: "导盲路径" },
  { key: "audioGuide", title: "手语讲解 / 语音导览" }
];

const ratingDimensions = [
  { key: "passage", title: "无障碍通道" },
  { key: "restroom", title: "无障碍卫生间" },
  { key: "guide", title: "无障碍讲解" }
];

function setRoute(route, patch = {}) {
  Object.assign(state, patch, { route, toast: "" });
  render();
}

function toast(text, options = {}) {
  state.toast = text;
  render({ preserveScroll: !!options.preserveScroll });
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => {
    state.toast = "";
    render({ preserveScroll: !!options.preserveScroll });
  }, 1300);
}

function render(options = {}) {
  const views = {
    start: renderStart,
    onboarding: renderOnboarding,
    welcome: renderWelcome,
    location: renderPermission,
    notification: renderPermission,
    home: renderHome,
    map: renderMap,
    detail: renderDetail,
    mission: renderMission,
    profile: renderProfile
  };
  const previousScrollTop = options.preserveScroll ? app.scrollTop : 0;
  app.scrollTop = 0;
  app.innerHTML = views[state.route]();
  if (state.lightbox) {
    app.insertAdjacentHTML("beforeend", lightboxHtml());
  }
  app.insertAdjacentHTML("beforeend", voiceWidgetsHtml());
  routeLabel.textContent = labels[state.route] || "演示";
  updateNav();
  if (options.preserveScroll) {
    requestAnimationFrame(() => {
      app.scrollTop = previousScrollTop;
    });
  }
}

function updateNav() {
  const shouldShow = ["home", "map", "detail", "mission", "profile"].includes(state.route);
  nav.style.display = shouldShow ? "grid" : "none";
  app.style.bottom = shouldShow ? "76px" : "0";
  const activeRoute = state.route === "mission" || state.route === "profile" ? state.route : "home";
  nav.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === activeRoute);
  });
}

function renderStart() {
  return `
    <section class="page yellow-page center">
      <div class="logo-card"><img class="logo-img" src="./assets/brand/lemon-logo-clear.png" alt="无界柠檬 logo" /></div>
      <h1 class="brand-title">无界柠檬</h1>
      <button class="primary" style="margin-top:220px" data-action="start-flow">开始体验</button>
      ${toastHtml()}
    </section>
  `;
}

function renderOnboarding() {
  const pages = [
    ["./assets/generated/onboarding-explore-vector.png", "探索无障碍景点", "查找适合所有人的旅行地。我们为你推荐配备无障碍设施的优质景区，让出行更安心。"],
    ["./assets/generated/onboarding-recommend-vector.png", "智能分析，贴心推荐", "系统自动采集社交平台评论，结合无障碍指标，智能打分，助你快速了解景区无障碍友好度。"],
    ["./assets/generated/onboarding-share-vector.png", "分享你的体验", "记录你的无障碍出行故事，上传评论与照片，帮助更多人获得便捷的旅行参考。"]
  ];
  const item = pages[state.onboarding];
  return `
    <section class="page">
      <img class="onboarding-visual" src="${item[0]}" alt="" />
      <div class="onboarding-card center">
        <h2>${item[1]}</h2>
        <p class="page-desc">${item[2]}</p>
        <div class="dots">${[0, 1, 2].map((dot) => `<span class="${dot === state.onboarding ? "active" : ""}"></span>`).join("")}</div>
        <button class="primary" style="margin-top:30px" data-action="next-onboarding">开始使用</button>
        <button class="link-button" data-action="skip-onboarding">暂时跳过</button>
      </div>
      ${toastHtml()}
    </section>
  `;
}

function renderWelcome() {
  return `
    <section class="page yellow-page">
      <div class="center" style="padding-top:96px">
        <div class="logo-card" style="margin:0 auto 18px"><img class="logo-img" src="./assets/brand/lemon-logo-clear.png" alt="无界柠檬 logo" /></div>
        <h1 style="font-size:42px;margin:0">无界柠檬</h1>
      </div>
      <div class="panel">
        <h2>欢迎来到无界柠檬</h2>
        <p>让无障碍出行成为可能，旅行无忧更自由。</p>
        <button class="primary" data-action="login">微信登录</button>
        <button class="primary login-red" data-action="login">QQ登录</button>
        <button class="primary login-blue" data-action="login">手机号登录</button>
        <button class="link-button" data-action="guest">浏览一下</button>
        <div class="two-actions">
          <button class="secondary" data-action="login">登录</button>
          <button class="primary" data-action="login">注册</button>
        </div>
      </div>
      ${toastHtml()}
    </section>
  `;
}

function renderPermission() {
  const isLocation = state.route === "location";
  return `
    <section class="page">
      <img class="permission-visual" src="${isLocation ? "./assets/permissions/location-visual-enhanced.png" : "./assets/permissions/notification-visual-enhanced.png"}" alt="" />
      <div class="center" style="padding-top:72px">
        <h2>${isLocation ? "启用定位服务" : "开启通知提醒"}</h2>
        <p class="page-desc">${isLocation ? "系统将为你推荐附近最适合的无障碍景点与设施，保障更便捷的出行体验。" : "及时接收景区评分更新、无障碍设施变更与出行建议。"}</p>
        <button class="primary" style="margin-top:54px" data-action="${isLocation ? "allow-location" : "allow-notification"}">开启</button>
      </div>
      ${toastHtml()}
    </section>
  `;
}

function renderHome() {
  return `
    <section class="page yellow-page">
      <button class="city-picker" data-action="choose-city">⌖ ${state.city}</button>
      <div class="top-row">
        <div>
          <h1 class="home-title">开启你的无障碍旅行之旅</h1>
          <p class="page-desc">智能推荐配置无障碍设施的景区与热门去处</p>
        </div>
        <button class="map-button" data-route="map">地图</button>
      </div>
      <div class="category-tabs">
        ${["无障碍景区", "无障碍酒店", "无障碍餐厅"].map((item) => `<button class="${state.filter === item ? "active" : ""}" data-filter="${item}">${item}</button>`).join("")}
      </div>
      ${placeCard("longhua")}
      ${placeCard("bund")}
      ${citySheet()}
      ${toastHtml()}
    </section>
  `;
}

function placeCard(id) {
  const place = places[id];
  const liked = !!state.liked[id];
  return `
    <article class="place-card" data-detail="${id}" tabindex="0" role="button" aria-label="查看${place.title}详情">
      <div class="place-cover" style="background-image:url('${place.cover}')"></div>
      <div class="place-body">
        <div class="meta">${place.area}</div>
        <h2 class="place-name">${place.title}</h2>
        <div class="score-row">
          <span class="badge">${place.score}</span>
          <button class="nav-to-place" data-route="map">导航到这去</button>
          <button class="favorite ${liked ? "liked" : ""}" data-like="${id}" aria-label="${liked ? "取消收藏" : "收藏"}${place.area.split(" · ")[1]}">${liked ? "♥" : "♡"} 收藏</button>
        </div>
      </div>
    </article>
  `;
}

function citySheet() {
  if (state.modal !== "city") return "";
  const cities = ["上海市", "北京市", "广州市", "杭州市", "成都市", "西安市"];
  return `
    <div class="modal-mask">
      <div class="modal city-modal">
        <h3>选择城市</h3>
        <div class="city-grid">
          ${cities.map((city) => `<button class="${state.city === city ? "active" : ""}" data-city="${city}">${city}</button>`).join("")}
        </div>
        <button class="secondary" data-action="close-modal">完成</button>
      </div>
    </div>
  `;
}

function renderMap() {
  return `
    <section class="page">
      <div class="top-row">
        <button class="back" data-route="home">‹</button>
        <input class="search" value="搜索无障碍友好景点" readonly />
      </div>
      <p class="page-desc" style="margin-top:10px">点击地点可查看无障碍设施评分与用户反馈</p>
      <div class="map-canvas">
        <button class="map-pin" style="left:118px;top:160px" data-detail="longhua">♿</button>
        <button class="map-pin" style="left:228px;top:215px" data-detail="bund">♿</button>
        <button class="map-pin" style="left:82px;top:330px" data-toast="附近无障碍卫生间">卫</button>
        <button class="map-pin" style="right:24px;bottom:26px" data-toast="已回到当前位置">⌖</button>
      </div>
      ${placeCard("longhua")}
      ${placeCard("bund")}
      ${toastHtml()}
    </section>
  `;
}

function renderDetail() {
  const place = places[state.detailPlace];
  const liked = !!state.detailLiked[state.detailPlace];
  return `
    <section class="page">
      <div class="detail-hero" style="background-image: linear-gradient(120deg, rgba(254,189,47,.92), rgba(254,189,47,.48) 48%, rgba(23,23,34,.12)), url('${place.cover}')">
        <div class="top-row">
          <button class="back icon-back" data-route="home" aria-label="返回首页"></button>
          <button class="back detail-heart ${liked ? "liked" : ""}" data-detail-like="${state.detailPlace}" aria-label="${liked ? "取消收藏" : "收藏景点"}">${liked ? "♥" : "♡"}</button>
        </div>
        <h1 class="detail-title">${place.title}</h1>
        <div class="score-row">
          <span class="badge">${place.score}</span>
          <span>${place.area}</span>
        </div>
      </div>
      <div class="tabs">
        ${tabButton("overview", "概览页")}
        ${tabButton("photo", "照片页")}
        ${tabButton("review", "评论与评分")}
        ${tabButton("community", "社区互动页")}
      </div>
      ${detailTabContent()}
      ${toastHtml()}
    </section>
  `;
}

function tabButton(tab, text) {
  return `<button class="${state.detailTab === tab ? "active" : ""}" data-tab="${tab}">${text}</button>`;
}

function detailTabContent() {
  const place = places[state.detailPlace];
  const review = userReviews[state.detailPlace];
  if (state.detailTab === "photo") {
    return `
      <h2 class="section-title">无障碍设施实拍</h2>
      ${photoSections.map((section) => gallerySection(section, sectionImages(review.images, section.key), `photo-${state.detailPlace}-${section.key}`)).join("")}
      <button class="secondary" data-toast="上传照片功能待接入">上传照片</button>
    `;
  }
  if (state.detailTab === "review") {
    return `
      <div class="review-box">
        <h2>无障碍友好度评分</h2>
        <p class="page-desc">请分享你在该景区的无障碍出行体验，这对他人选择有重要帮助。</p>
        ${ratingDimensions.map((item) => ratingBlock(item)).join("")}
        <button class="voice-input" data-action="voice-review">语音输入评价</button>
        <textarea data-review-draft placeholder="写下你的体验，1000字以内">${state.reviewDraft}</textarea>
        <button class="secondary" data-action="submit-review">提交评价</button>
      </div>
      <h2 class="section-title">已评价用户</h2>
      ${reviewPost(review)}
    `;
  }
  if (state.detailTab === "community") {
    return `
      <h2 class="section-title">分享你的无障碍旅行故事</h2>
      ${communityPost(review)}
    `;
  }
  return `
    <h2 class="section-title">概述</h2>
    <p class="page-desc">${place.desc}</p>
    <h2 class="section-title">无障碍信息</h2>
    <button class="facility facility-link" data-photo-section="passage"><span>♿ 无障碍通道</span><strong>有</strong></button>
    <button class="facility facility-link" data-photo-section="restroom"><span>🚻 无障碍洗手间</span><strong>有</strong></button>
    <button class="facility facility-link" data-photo-section="blindPath"><span>╱ 导盲路径</span><strong class="no">无</strong></button>
    <button class="facility facility-link" data-photo-section="audioGuide"><span>🗣 手语讲解 / 语音导览</span><strong class="no">无</strong></button>
    <h2 class="section-title">附近</h2>
    <div class="facility"><span>无障碍餐饮</span><button class="pill" data-toast="查看附近餐饮">查看</button></div>
    <div class="facility"><span>无障碍酒店</span><button class="pill" data-toast="查看附近酒店">查看</button></div>
    <div class="facility"><span>无障碍娱乐</span><button class="pill" data-toast="查看附近娱乐">查看</button></div>
    <button class="secondary" data-route="map">地址导航</button>
  `;
}

function sectionImages(images, key) {
  const rotated = {
    passage: images,
    restroom: [...images.slice(1), images[0]],
    blindPath: [...images.slice(2), ...images.slice(0, 2)],
    audioGuide: [...images.slice(3), ...images.slice(0, 3)]
  }[key] || images;
  return rotated.filter(Boolean);
}

function gallerySection(section, images, galleryId) {
  const expanded = !!state.expanded[galleryId];
  const visible = expanded ? images : images.slice(0, 4);
  return `
    <section class="photo-section" data-section-id="${galleryId}">
      <div class="section-head">
        <h3>${section.title}</h3>
        <span>${images.length} 张</span>
      </div>
      ${galleryGrid(visible, images, galleryId)}
      ${images.length > 4 ? `<button class="show-more" data-expand="${galleryId}">${expanded ? "收起图片" : "显示更多"}</button>` : ""}
    </section>
  `;
}

function galleryGrid(visible, allImages, galleryId) {
  return `
    <div class="photo-grid">
      ${visible.map((src, index) => `
        <button class="photo-tile photo-real" data-gallery="${galleryId}" data-gallery-images="${allImages.join("|")}" data-gallery-index="${index}" aria-label="查看图片 ${index + 1}">
          <img src="${src}" alt="现场照片 ${index + 1}" />
        </button>
      `).join("")}
    </div>
  `;
}

function ratingBlock(item) {
  const value = state.ratings[item.key] || 0;
  return `
    <div class="rating-block">
      <div class="rating-title">
        <strong>${item.title}</strong>
        <label class="upload-inline">
          上传图片
          <input type="file" accept="image/*" data-upload="${item.key}" />
        </label>
      </div>
      <div class="rating-stars" aria-label="${item.title}评分">
        ${[1, 2, 3, 4, 5].map((star) => `<button class="${star <= value ? "active" : ""}" data-rate-key="${item.key}" data-rate-value="${star}" aria-label="${item.title} ${star}星">★</button>`).join("")}
      </div>
    </div>
  `;
}

function voiceWidgetsHtml() {
  return `
    <button
      class="voice-fab ${state.voiceMode ? "active" : ""}"
      style="left:${state.voicePos.x}px; top:${state.voicePos.y}px"
      data-action="toggle-voice-panel"
      data-draggable-voice="true"
      aria-label="语音操作模式"
    >语</button>
    ${state.voicePanel ? `
      <section class="voice-panel" aria-label="语音操作面板">
        <div class="voice-panel-head">
          <strong>语音操作模式</strong>
          <button data-action="toggle-voice-panel" aria-label="关闭语音面板">×</button>
        </div>
        <p>${state.listening ? "正在聆听，请说出指令…" : "点击下方指令，模拟语音识别结果。"}</p>
        <button class="voice-main ${state.listening ? "listening" : ""}" data-action="voice-listen">${state.listening ? "聆听中…" : "开始语音指令"}</button>
        <div class="voice-command-list">
          ${[
            ["回到首页", "home"],
            ["打开任务", "mission"],
            ["打开我的", "profile"],
            ["打开地图", "map"],
            ["切到照片页", "photo"],
            ["切到评论与评分", "review"],
            ["显示更多图片", "more"],
            ["提交评价", "submit"]
          ].map(([label, command]) => `<button data-voice-command="${command}">${label}</button>`).join("")}
        </div>
      </section>
    ` : ""}
  `;
}

function reviewPost(review) {
  return `
    <article class="post">
      <div class="review-header">
        <img class="review-avatar" src="${review.avatar}" alt="${review.user}头像" />
        <div>
          <h3>${review.user} <span class="badge">${review.score}</span></h3>
          <small>${review.time}</small>
        </div>
      </div>
      <p>${review.text.replace(/\n/g, "<br />")}</p>
      ${reviewGallery(review)}
    </article>
  `;
}

function communityPost(review) {
  return `
    <article class="post">
      <div class="review-header">
        <img class="review-avatar" src="${review.avatar}" alt="${review.user}头像" />
        <div>
          <h3>${review.user}</h3>
          <small>${review.time}</small>
        </div>
      </div>
      <p>${review.tags}</p>
      <p>${review.text}</p>
      ${reviewGallery(review, "community")}
      <div class="post-actions">
        <button data-toast="已点赞">点赞</button>
        <button data-toast="评论功能待接入">评论</button>
        <button data-toast="已打开分享">分享</button>
      </div>
    </article>
  `;
}

function reviewGallery(review, suffix = "review") {
  const galleryId = `${suffix}-${review.user}`;
  const expanded = !!state.expanded[galleryId];
  const visible = expanded ? review.images : review.images.slice(0, 4);
  return `
    <div class="review-images">
      ${visible.map((src, index) => `
        <button class="review-image-button" data-gallery="${galleryId}" data-gallery-images="${review.images.join("|")}" data-gallery-index="${index}" aria-label="查看${review.user}评论图片${index + 1}">
          <img src="${src}" alt="${review.user}评论图片${index + 1}" />
        </button>
      `).join("")}
    </div>
    ${review.images.length > 4 ? `<button class="show-more" data-expand="${galleryId}">${expanded ? "收起图片" : "显示更多"}</button>` : ""}
  `;
}

function lightboxHtml() {
  const { images, index } = state.lightbox;
  const src = images[index];
  return `
    <div class="lightbox" role="dialog" aria-label="图片查看">
      <button class="lightbox-close" data-action="close-lightbox" aria-label="关闭">×</button>
      <button class="lightbox-arrow left" data-action="prev-image" aria-label="上一张">‹</button>
      <img src="${src}" alt="放大的现场图片" />
      <button class="lightbox-arrow right" data-action="next-image" aria-label="下一张">›</button>
      <button class="lightbox-comment" data-action="image-comment">查看评论</button>
    </div>
  `;
}

function renderMission() {
  return `
    <section class="page">
      <div class="top-row">
        <div><strong>👑 无障碍体验官</strong></div>
        <div style="color:#dc9300;font-weight:800">4685 积分</div>
      </div>
      <div class="tabs" style="margin-top:18px">
        <button class="${state.modal === "achievements" ? "" : "active"}" data-action="mission-list">任务</button>
        <button class="${state.modal === "achievements" ? "active" : ""}" data-action="achievement-list">成就</button>
      </div>
      ${state.modal === "achievements" ? achievementsHtml() : missionsHtml()}
      ${state.modal && state.modal !== "achievements" ? modalHtml(state.modal) : ""}
      ${toastHtml()}
    </section>
  `;
}

function missionsHtml() {
  return `
    <article class="task-card"><h3>上传 10 张无障碍设施照片</h3><button class="mini-button" data-modal="task">立即加入</button></article>
    <article class="task-card"><h3>收集 100 条与“坡道、盲道”相关评价</h3><button class="mini-button" data-modal="task">立即加入</button></article>
    <article class="task-card"><h3>邀请 3 位用户参与无障碍共建计划</h3><button class="mini-button" data-modal="task">立即加入</button></article>
  `;
}

function achievementsHtml() {
  return `
    <div class="achievement-grid">
      ${["无障碍巡查员","路线优化达人","语音导航体验官","智能数据标注志愿者","无障碍图像采集师","好伙伴传播者"].map((item, index) => `
        <button class="achievement" data-modal="${index % 2 ? "badge" : "task"}"><div class="achievement-icon">${index % 2 ? "🏅" : "👑"}</div><strong>${item}</strong></button>
      `).join("")}
    </div>
  `;
}

function modalHtml(type) {
  const badge = type === "badge";
  return `
    <div class="modal-mask">
      <div class="modal">
        <h3>${badge ? "成就解锁：“智能辅助贡献者”" : "恭喜你完成任务！"}</h3>
        <div class="gift">${badge ? "🏅" : "🎁"}</div>
        <p class="page-desc">${badge ? "奖励积分 +100，你上传的照片已帮助智能模型完成训练。" : "你已邀请 3 位新用户并共同完善了城市无障碍地图。"}</p>
        <div class="two-actions">
          <button class="primary" data-action="close-modal">返回</button>
          <button class="secondary" data-toast="已打开分享">分享</button>
        </div>
      </div>
    </div>
  `;
}

function renderProfile() {
  return `
    <section class="page">
      <div class="profile-head">
        <div class="top-row">
          <div class="avatar">🙂</div>
          <div>
            <h2 style="margin:0">欢迎你，出行守护者</h2>
            <p class="page-desc">等级：社区志愿者 / 智能推荐贡献者</p>
          </div>
        </div>
        <div class="profile-card">
          <strong>当前角色：无障碍体验官</strong>
          <p style="margin:8px 0 0;color:#d8dbe5">积分：4685｜已影响用户：2544人</p>
        </div>
      </div>
      <h2 class="section-title">账户</h2>
      ${menu("个人信息")}
      ${menu("修改密码")}
      ${menu("我的好友")}
      ${menu("切换到本地导览")}
      <h2 class="section-title">通知</h2>
      ${menu("消息弹窗", { switchKey: "message" })}
      ${menu("邮件提醒", { switchKey: "email" })}
      <h2 class="section-title">我的出游</h2>
      ${menu("我的上传")}
      ${menu("我的评价")}
      ${menu("我的路线")}
      ${toastHtml()}
    </section>
  `;
}

function menu(text, options = {}) {
  if (options.switchKey) {
    const isOn = !!state.switches[options.switchKey];
    return `<button class="menu-row" data-switch="${options.switchKey}" aria-label="${text}${isOn ? "已开启" : "已关闭"}"><span>${text}</span><span class="switch ${isOn ? "on" : "off"}"></span></button>`;
  }
  return `<button class="menu-row" data-toast="${text}"><span>${text}</span><span>›</span></button>`;
}

function toastHtml() {
  return state.toast ? `<div class="toast">${state.toast}</div>` : "";
}

document.body.addEventListener("click", (event) => {
  const routeTarget = event.target.closest("[data-route]");
  if (routeTarget) {
    setRoute(routeTarget.dataset.route);
    return;
  }

  const tabTarget = event.target.closest("[data-tab]");
  if (tabTarget) {
    state.detailTab = tabTarget.dataset.tab;
    render();
    return;
  }

  const toastTarget = event.target.closest("[data-toast]");
  if (toastTarget) {
    toast(toastTarget.dataset.toast, { preserveScroll: true });
    return;
  }

  const modalTarget = event.target.closest("[data-modal]");
  if (modalTarget) {
    state.modal = modalTarget.dataset.modal;
    render();
    return;
  }

  const filterTarget = event.target.closest("[data-filter]");
  if (filterTarget) {
    state.filter = filterTarget.dataset.filter;
    toast(`已切换到：${state.filter}`, { preserveScroll: true });
    return;
  }

  const likeTarget = event.target.closest("[data-like]");
  if (likeTarget) {
    const id = likeTarget.dataset.like;
    state.liked[id] = !state.liked[id];
    toast(state.liked[id] ? "已收藏" : "已取消收藏", { preserveScroll: true });
    return;
  }

  const detailLikeTarget = event.target.closest("[data-detail-like]");
  if (detailLikeTarget) {
    const id = detailLikeTarget.dataset.detailLike;
    state.detailLiked[id] = !state.detailLiked[id];
    toast(state.detailLiked[id] ? "已收藏景点" : "已取消收藏", { preserveScroll: true });
    return;
  }

  const rateTarget = event.target.closest("[data-rate-key]");
  if (rateTarget) {
    state.ratings[rateTarget.dataset.rateKey] = Number(rateTarget.dataset.rateValue);
    render({ preserveScroll: true });
    return;
  }

  const expandTarget = event.target.closest("[data-expand]");
  if (expandTarget) {
    const id = expandTarget.dataset.expand;
    state.expanded[id] = !state.expanded[id];
    render({ preserveScroll: true });
    return;
  }

  const galleryTarget = event.target.closest("[data-gallery]");
  if (galleryTarget) {
    state.lightbox = {
      images: galleryTarget.dataset.galleryImages.split("|"),
      index: Number(galleryTarget.dataset.galleryIndex) || 0
    };
    render();
    return;
  }

  const detailTarget = event.target.closest("[data-detail]");
  if (detailTarget) {
    setRoute("detail", { detailPlace: detailTarget.dataset.detail, detailTab: "overview" });
    return;
  }

  const cityTarget = event.target.closest("[data-city]");
  if (cityTarget) {
    state.city = cityTarget.dataset.city;
    state.modal = null;
    toast(`已切换城市：${state.city}`, { preserveScroll: true });
    return;
  }

  const voiceCommandTarget = event.target.closest("[data-voice-command]");
  if (voiceCommandTarget) {
    runVoiceCommand(voiceCommandTarget.dataset.voiceCommand);
    return;
  }

  const switchTarget = event.target.closest("[data-switch]");
  if (switchTarget) {
    const key = switchTarget.dataset.switch;
    state.switches[key] = !state.switches[key];
    render({ preserveScroll: true });
    return;
  }

  const photoSectionTarget = event.target.closest("[data-photo-section]");
  if (photoSectionTarget) {
    state.detailTab = "photo";
    render();
    requestAnimationFrame(() => {
      const section = app.querySelector(`[data-section-id="photo-${state.detailPlace}-${photoSectionTarget.dataset.photoSection}"]`);
      section?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  if (action === "start-flow") setRoute("onboarding", { onboarding: 0 });
  if (action === "next-onboarding") {
    if (state.onboarding < 2) setRoute("onboarding", { onboarding: state.onboarding + 1 });
    else setRoute("welcome");
  }
  if (action === "skip-onboarding") setRoute("welcome");
  if (action === "login" || action === "guest") setRoute("location");
  if (action === "allow-location") setRoute("notification");
  if (action === "allow-notification") setRoute("home");
  if (action === "choose-city") {
    state.modal = "city";
    render();
  }
  if (action === "mission-list") {
    state.modal = null;
    render();
  }
  if (action === "achievement-list") {
    state.modal = "achievements";
    render();
  }
  if (action === "close-modal") {
    state.modal = state.route === "mission" ? "achievements" : null;
    render();
  }
  if (action === "close-lightbox") {
    state.lightbox = null;
    render();
  }
  if (action === "prev-image" && state.lightbox) {
    state.lightbox.index = (state.lightbox.index - 1 + state.lightbox.images.length) % state.lightbox.images.length;
    render();
  }
  if (action === "next-image" && state.lightbox) {
    state.lightbox.index = (state.lightbox.index + 1) % state.lightbox.images.length;
    render();
  }
  if (action === "image-comment") {
    state.lightbox = null;
    state.detailTab = "review";
    render();
  }
  if (action === "submit-review") {
    state.reviewDraft = "";
    toast("感谢您宝贵的评论，积分+10", { preserveScroll: true });
  }
  if (action === "toggle-voice-panel") {
    if (state.voiceMoved) {
      state.voiceMoved = false;
      return;
    }
    state.voiceMode = true;
    state.voicePanel = !state.voicePanel;
    state.listening = false;
    render({ preserveScroll: true });
  }
  if (action === "voice-listen") {
    state.voiceMode = true;
    state.voicePanel = true;
    state.listening = true;
    render({ preserveScroll: true });
    window.setTimeout(() => {
      state.listening = false;
      runVoiceCommand(state.route === "detail" ? "review" : "home");
    }, 800);
  }
  if (action === "voice-review") {
    state.reviewDraft = "这里的无障碍卫生间标识清楚，通道较宽，轮椅回转比较方便，但部分抓杆位置还可以继续优化。";
    toast("已识别语音并转成文字", { preserveScroll: true });
  }
});

function runVoiceCommand(command) {
  state.voiceMode = true;
  state.voicePanel = true;
  state.listening = false;
  if (command === "home") setRoute("home");
  if (command === "mission") setRoute("mission");
  if (command === "profile") setRoute("profile");
  if (command === "map") setRoute("map");
  if (command === "photo") {
    state.route = "detail";
    state.detailTab = "photo";
    toast("已切换到照片页", { preserveScroll: true });
  }
  if (command === "review") {
    state.route = "detail";
    state.detailTab = "review";
    toast("已切换到评论与评分", { preserveScroll: true });
  }
  if (command === "more") {
    const id = `photo-${state.detailPlace}-passage`;
    state.route = "detail";
    state.detailTab = "photo";
    state.expanded[id] = true;
    toast("已展开更多图片", { preserveScroll: true });
  }
  if (command === "submit") {
    state.route = "detail";
    state.detailTab = "review";
    state.reviewDraft = "";
    toast("感谢您宝贵的评论，积分+10", { preserveScroll: true });
  }
}

document.body.addEventListener("input", (event) => {
  if (event.target.matches("[data-review-draft]")) {
    state.reviewDraft = event.target.value;
  }
});

document.body.addEventListener("pointerdown", (event) => {
  const target = event.target.closest("[data-draggable-voice]");
  if (!target) return;
  state.draggingVoice = {
    offsetX: event.clientX - state.voicePos.x,
    offsetY: event.clientY - state.voicePos.y,
    startX: event.clientX,
    startY: event.clientY
  };
  target.setPointerCapture?.(event.pointerId);
});

document.body.addEventListener("pointermove", (event) => {
  if (!state.draggingVoice) return;
  const shell = document.querySelector(".phone").getBoundingClientRect();
  const size = 54;
  const nextX = Math.min(Math.max(event.clientX - shell.left - state.draggingVoice.offsetX, 8), shell.width - size - 8);
  const nextY = Math.min(Math.max(event.clientY - shell.top - state.draggingVoice.offsetY, 8), shell.height - size - 8);
  if (Math.abs(event.clientX - state.draggingVoice.startX) > 4 || Math.abs(event.clientY - state.draggingVoice.startY) > 4) {
    state.voiceMoved = true;
  }
  state.voicePos = { x: nextX, y: nextY };
  const fab = document.querySelector(".voice-fab");
  if (fab) {
    fab.style.left = `${nextX}px`;
    fab.style.top = `${nextY}px`;
  }
});

document.body.addEventListener("pointerup", () => {
  state.draggingVoice = false;
});

document.body.addEventListener("change", (event) => {
  if (event.target.matches("[data-upload]")) {
    const label = ratingDimensions.find((item) => item.key === event.target.dataset.upload)?.title || "该维度";
    toast(`${label}图片已选择`, { preserveScroll: true });
  }
});

fontTools.addEventListener("click", (event) => {
  const target = event.target.closest("[data-font]");
  if (!target) return;
  document.body.classList.remove("font-friendly", "font-clear", "font-young");
  document.body.classList.add(`font-${target.dataset.font}`);
  fontTools.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button === target);
  });
});

render();
