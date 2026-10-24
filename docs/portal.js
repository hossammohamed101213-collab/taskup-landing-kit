/* TaskUp: account-request dialog + client portal (demo data). Built lazily on first open so it costs nothing until used. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduced = false;
  try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  function lng() { return typeof window.taskupLang === "function" ? window.taskupLang() : "ar"; }
  function q(s, r) { return (r || doc).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  var locks = 0;
  function lock(on) { locks = Math.max(0, locks + (on ? 1 : -1)); root.classList.toggle("modal-open", locks > 0); }
  function T(k) { return typeof window.taskupI18n === "function" ? window.taskupI18n(k) : ""; }

  /* ===================================================== account request + request tracking */
  var PLANS = [
    { id: "b", code: "B", c1: "#f0b07a", c2: "#b9693a", rgb: "232,160,106" },
    { id: "s", code: "S", c1: "#eef3fb", c2: "#9fb1cc", rgb: "190,205,230" },
    { id: "g", code: "G", c1: "#ffe08a", c2: "#ff9f1c", rgb: "255,200,87", vip: true }
  ];
  var PLAN_N = { id: "n", code: "N", c1: "#a9ecff", c2: "#22a8e0", rgb: "34,200,255" };
  function plan(id) { if (id === "n") return PLAN_N; for (var i = 0; i < PLANS.length; i++) if (PLANS[i].id === id) return PLANS[i]; return PLANS[1]; }
  var ICON = {
    g: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><rect x="5" y="20" width="14" height="2" rx="1"/></svg>',
    s: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z"/></svg>',
    b: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="9" r="6"/><path d="M8 14l-2 8 6-3 6 3-2-8z"/></svg>',
    n: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>'
  };
  var RT = {
    ar: {
      "eye": "طلب فتح حساب", "title": "قدّم طلب فتح حساب معانا", "sub": "املا بياناتك في دقيقة، وفريقنا هيتواصل معاك ويجهّز لك حسابك وبوابتك.",
      "f.name": "اسمك", "f.biz": "اسم نشاطك أو شركتك", "f.phone": "رقم الموبايل (واتساب)", "f.email": "الإيميل", "f.type": "نوع النشاط", "f.other": "اكتب نوع نشاطك", "f.count": "عدد عملائك تقريباً", "f.note": "حاجة تحب نعرفها؟", "f.plan": "اختار باقتك", "opt": "(اختياري)",
      "ph.name": "كريم أحمد", "ph.biz": "متجر نور", "ph.other": "مثال: مكتب محاسبة", "ph.select": "اختار…", "ph.email": "name@company.com",
      "types": ["وكالة تسويق", "متجر إلكتروني", "شركة برمجة", "استوديو تصميم", "صانع محتوى", "عيادة أو مركز", "تسويق عقاري", "شركة ناشئة"], "type.other": "حاجة تانية (هكتبها)",
      "counts": ["من 1 لـ 5", "من 6 لـ 20", "من 21 لـ 50", "أكتر من 50"],
      "err.name": "اكتب اسمك من فضلك.", "err.phone": "اكتب رقم موبايل صحيح.", "err.email": "اكتب إيميل صحيح، هنبعتلك عليه تفاصيل حسابك.", "err.type": "اختار نوع نشاطك.", "err.other": "اكتب نوع نشاطك.",
      "alert": "في خانات لسه ناقصة. كمّلها وجرّب تاني.", "send": "ابعت الطلب", "fine": "بياناتك بتتستخدم للتواصل معاك بخصوص الحساب بس.", "close": "إغلاق",
      "plan.b.n": "البرونزية", "plan.b.t": "للبداية", "plan.b.d": "لحد 3 عملاء",
      "plan.s.n": "الفضية", "plan.s.t": "للفرق الصغيرة", "plan.s.d": "لحد 20 عميل",
      "plan.g.n": "الذهبية VIP", "plan.g.t": "للأعمال الكبيرة", "plan.g.d": "بدون حد + مدير حساب مخصص", "plan.pre": "الباقة {n}",
      "done.hi": "شكراً يا {n}! أهلاً بيك في عيلة TaskUp", "done.p": "استلمنا بياناتك. ده رقم طلبك، وهتتابع بيه كل حاجة من أي مكان في الموقع.", "done.no": "رقم طلبك", "done.h": "إيه اللي تعمله بالرقم ده؟",
      "steps": ["<b>احتفظ بالرقم ده.</b> هو مفتاحك لكل حاجة، واتحفظ في متصفحك كمان.", "دوس <b>«ابعت الطلب على واتساب»</b> تحت، وفريقنا يبدأ يجهّز حسابك.", "أي وقت تكلمنا فيه، قول لنا <b>باقتك ورقمك</b> علشان نوصّلك لفريقك على طول.", "تتبّع طلبك من أي قسم في الموقع: دوس <b>«تتبّع طلبك»</b> واكتب الرقم.", "أول ما حسابك يتفعّل هنبعتلك كود بوابتك، وتدخل منها تتابع مشروعك."],
      "vip": "أولوية VIP: مدير حساب مخصص هيتواصل معاك.", "wa": "ابعت الطلب على واتساب", "copy": "انسخ الرقم", "copied": "اتنسخ", "track": "تتبّع طلبك", "back": "رجوع للموقع",
      "msg.l": ["طلب فتح حساب في TaskUp", "رقم الطلب", "الباقة", "الاسم", "النشاط", "نوع النشاط", "عدد العملاء", "الموبايل", "الإيميل", "ملاحظات"],
      "msg.ask": "أنا صاحب الطلب رقم {no} (الباقة {p}). عايز أعرف حالة طلبي.",
      "tr.t": "تتبّع طلبك أو شكواك", "tr.p": "اكتب رقم طلبك أو شكواك وهنوريك وصل لفين.", "tr.ph": "TU-G-48213", "tr.go": "تتبّع", "tr.err": "اكتب رقم الطلب الأول.", "tr.lab": "رقم الطلب أو الشكوى",
      "tr.nf": "الرقم ده مش متسجّل في المتصفح ده. لو قدّمت من جهاز تاني، ابعتلنا رقمك على واتساب وهنرد عليك بحالته.",
      "tr.ask": "اسأل عن حالة طلبك على واتساب", "tr.note": "لو عايز آخر تحديث، كلّمنا على واتساب وقول لنا رقمك وباقتك.",
      "tl": [["الطلب اتسجّل", "{t}"], ["الطلب اتبعت لفريقنا", ""], ["فريقنا بيراجع بياناتك", "هنتواصل معاك على موبايلك"], ["بنفتحلك حسابك", "هنبعتلك كود بوابتك"], ["بوابتك جاهزة", "تدخل وتتابع مشروعك لحظة بلحظة"]],
      "tl.sent": "اتبعت {t}", "tl.nosent": "لسه. دوس زرار واتساب علشان يوصل لنا"
    },
    en: {
      "eye": "Account request", "title": "Request an account with us", "sub": "Fill in your details in a minute, and our team will get in touch and set up your account and portal.",
      "f.name": "Your name", "f.biz": "Business or company name", "f.phone": "Mobile (WhatsApp)", "f.email": "Email", "f.type": "Type of business", "f.other": "Describe your business", "f.count": "Roughly how many clients do you have?", "f.note": "Anything you'd like us to know?", "f.plan": "Choose your plan", "opt": "(optional)",
      "ph.name": "Karim Ahmed", "ph.biz": "Noor Store", "ph.other": "e.g. Accounting office", "ph.select": "Choose…", "ph.email": "name@company.com",
      "types": ["Marketing agency", "Online store", "Software company", "Design studio", "Content creator", "Clinic or centre", "Real-estate marketing", "Startup"], "type.other": "Something else (I'll type it)",
      "counts": ["1 to 5", "6 to 20", "21 to 50", "More than 50"],
      "err.name": "Please enter your name.", "err.phone": "Please enter a valid mobile number.", "err.email": "Please enter a valid email. We'll send your account details there.", "err.type": "Please choose your type of business.", "err.other": "Please describe your business.",
      "alert": "Some fields are still missing. Fill them in and try again.", "send": "Send request", "fine": "Your details are only used to contact you about the account.", "close": "Close",
      "plan.b.n": "Bronze", "plan.b.t": "To get started", "plan.b.d": "Up to 3 clients",
      "plan.s.n": "Silver", "plan.s.t": "For small teams", "plan.s.d": "Up to 20 clients",
      "plan.g.n": "Gold VIP", "plan.g.t": "For larger businesses", "plan.g.d": "No limit + a dedicated account manager", "plan.pre": "{n} plan",
      "done.hi": "Thank you, {n}! Welcome to the TaskUp family", "done.p": "We've got your details. This is your request number, and you can follow everything with it from anywhere on the site.", "done.no": "Your request number", "done.h": "What to do with this number",
      "steps": ["<b>Keep this number.</b> It's the key to everything, and we've saved it in your browser too.", "Press <b>“Send request on WhatsApp”</b> below and our team starts preparing your account.", "Whenever you contact us, tell us <b>your plan and your number</b> so we can connect you with your team straight away.", "Track your request from any section of the site: press <b>“Track your request”</b> and enter the number.", "As soon as your account is active we'll send you your portal code, and you can follow your project from there."],
      "vip": "VIP priority: a dedicated account manager will contact you.", "wa": "Send request on WhatsApp", "copy": "Copy number", "copied": "Copied", "track": "Track your request", "back": "Back to the site",
      "msg.l": ["Account request, TaskUp", "Request number", "Plan", "Name", "Business", "Type of business", "Clients", "Mobile", "Email", "Notes"],
      "msg.ask": "I'm the owner of request {no} ({p} plan). I'd like to know its status.",
      "tr.t": "Track your request or complaint", "tr.p": "Enter your request or complaint number and we'll show you where it stands.", "tr.ph": "TU-G-48213", "tr.go": "Track", "tr.err": "Please enter your request number.", "tr.lab": "Request or complaint number",
      "tr.nf": "This number isn't saved in this browser. If you applied from another device, send us your number on WhatsApp and we'll reply with its status.",
      "tr.ask": "Ask about your request on WhatsApp", "tr.note": "For the latest update, message us on WhatsApp with your number and your plan.",
      "tl": [["Request registered", "{t}"], ["Request sent to our team", ""], ["Our team reviews your details", "We'll contact you on your mobile"], ["We set up your account", "We'll send you your portal code"], ["Your portal is ready", "Sign in and follow your project live"]],
      "tl.sent": "Sent {t}", "tl.nosent": "Not yet. Press the WhatsApp button so it reaches us"
    }
  };
  function rt(k, v) {
    var s = (RT[lng()] || RT.ar)[k]; if (s == null) s = RT.ar[k]; if (s == null) return k;
    if (v && typeof s === "string") for (var x in v) s = s.split("{" + x + "}").join(v[x]);
    return s;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function digits(s) { return String(s || "").replace(/\D/g, ""); }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var KEY = "taskup-requests", MEM = [];
  function loadRecs() { try { var a = JSON.parse(localStorage.getItem(KEY) || "[]"); if (a && a.length) return a; } catch (e) {} return MEM; }
  function saveRec(r) {
    var a = loadRecs().filter(function (x) { return x.no !== r.no; }); a.unshift(r); a = a.slice(0, 5); MEM = a;
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
  }
  function findRec(no) {
    var d = digits(no), u = String(no || "").trim().toUpperCase(); if (d.length < 4) return null;
    var a = loadRecs(), want = /^CP/.test(u) ? "c" : /^TU/.test(u) ? "r" : "";
    for (var i = 0; i < a.length; i++) if (digits(a[i].no) === d && (!want || (want === "c") === (a[i].kind === "c"))) return a[i];
    return null;
  }
  function waBase() { return ((q("#csFab") || {}).href || "https://wa.me/201000000000").split("?")[0]; }
  function fmtTime(ts) { return new Date(ts).toLocaleString(lng() === "en" ? "en-GB" : "ar-EG-u-nu-latn", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
  function planLabel(id) { return id === "n" ? rt("plan.n.l") : rt("plan.pre", { n: rt("plan." + id + ".n") }); }
  function vars(p) { return "--c1:" + p.c1 + ";--c2:" + p.c2 + ";--rgb:" + p.rgb; }
  function shake(el) { el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
  function trap(m) {
    m.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = qa("a[href],button:not([disabled]),input,select,textarea", m).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); }
    });
    m.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) { if (m === rq) closeRequest(); else if (m === cpm) closeComplaint(); else closeTrack(); } });
  }

  /* ---- header chip showing the saved request number in its plan colour ---- */
  function paintChip() {
    var b = q("#hdTrack"); if (!b) return;
    var r = loadRecs()[0], n = q(".trk-no", b);
    if (r) { var p = plan(r.plan); b.setAttribute("style", vars(p)); b.classList.add("has"); n.textContent = r.no; n.hidden = false; }
    else { b.classList.remove("has"); n.hidden = true; }
  }

  /* ---- request dialog ---- */
  var rq = q("#rqModal"), rqIn = q("#rqInner"), rqLast = null;
  var BLANK = function () { return { name: "", biz: "", phone: "", email: "", type: "", other: "", count: "", plan: "s", note: "" }; };
  var RQ = { view: "form", d: BLANK(), rec: null, msg: "", alert: false };
  function field(key, label, inner, opts) {
    opts = opts || {};
    return '<div class="rq-f' + (opts.wide ? " wide" : "") + (opts.cls ? " " + opts.cls : "") + '" data-box="' + key + '"><label for="rq-' + key + '">' + label + (opts.req ? '<span class="rq-star" aria-hidden="true">*</span>' : ' <span class="rq-opt">' + rt("opt") + "</span>") + '</label>' + inner + '<span class="rq-err" role="alert"></span></div>';
  }
  function formHtml() {
    var d = RQ.d, types = rt("types"), counts = rt("counts"), tO = '<option value="">' + rt("ph.select") + "</option>", cO = '<option value="">' + rt("ph.select") + "</option>", i;
    for (i = 0; i < types.length; i++) tO += '<option value="' + i + '"' + (d.type === String(i) ? " selected" : "") + ">" + types[i] + "</option>";
    tO += '<option value="other"' + (d.type === "other" ? " selected" : "") + ">" + rt("type.other") + "</option>";
    for (i = 0; i < counts.length; i++) cO += '<option value="' + i + '"' + (d.count === String(i) ? " selected" : "") + ">" + counts[i] + "</option>";
    var plans = PLANS.map(function (p) {
      var on = d.plan === p.id;
      return '<label class="plan' + (p.vip ? " vip" : "") + (on ? " on" : "") + '" style="' + vars(p) + '"><input type="radio" name="rqPlan" value="' + p.id + '"' + (on ? " checked" : "") + '><span class="pl-badge">' + (p.vip ? "VIP" : "") + "</span><span class=\"pl-ic\">" + ICON[p.id] + "</span><b>" + rt("plan." + p.id + ".n") + "</b><small>" + rt("plan." + p.id + ".t") + "</small><em>" + rt("plan." + p.id + ".d") + "</em></label>";
    }).join("");
    return '<div class="rq-body"><span class="eyebrow">' + rt("eye") + '</span><h2 class="rq-title title-gradient rainbow" id="rqTitle">' + rt("title") + '</h2><p class="rq-sub">' + rt("sub") + "</p>" +
      '<form id="rqFormEl" novalidate>' +
      field("name", rt("f.name"), '<input id="rq-name" data-f="name" autocomplete="name" value="' + esc(d.name) + '" placeholder="' + esc(rt("ph.name")) + '">', { req: 1 }) +
      field("biz", rt("f.biz"), '<input id="rq-biz" data-f="biz" autocomplete="organization" value="' + esc(d.biz) + '" placeholder="' + esc(rt("ph.biz")) + '">') +
      field("phone", rt("f.phone"), '<input id="rq-phone" data-f="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" value="' + esc(d.phone) + '" placeholder="01xxxxxxxxx">', { req: 1 }) +
      field("email", rt("f.email"), '<input id="rq-email" data-f="email" type="email" autocomplete="email" dir="ltr" value="' + esc(d.email) + '" placeholder="' + esc(rt("ph.email")) + '">', { req: 1 }) +
      field("type", rt("f.type"), '<select id="rq-type" data-f="type">' + tO + "</select>", { req: 1 }) +
      field("count", rt("f.count"), '<select id="rq-count" data-f="count">' + cO + "</select>") +
      field("other", rt("f.other"), '<input id="rq-other" data-f="other" value="' + esc(d.other) + '" placeholder="' + esc(rt("ph.other")) + '">', { req: 1, wide: 1, cls: "rq-other" + (d.type === "other" ? " open" : "") }) +
      '<fieldset class="rq-f wide rq-plans"><legend>' + rt("f.plan") + '</legend><div class="plans">' + plans + "</div></fieldset>" +
      field("note", rt("f.note"), '<textarea id="rq-note" data-f="note" rows="2">' + esc(d.note) + "</textarea>", { wide: 1 }) +
      (RQ.alert ? '<div class="rq-alert" role="alert">' + rt("alert") + "</div>" : "") +
      '<div class="rq-actions"><button class="btn btn-primary" type="submit">' + rt("send") + '</button><p class="rq-fine">' + rt("fine") + "</p></div></form></div>";
  }
  function ticketHtml(rec) {
    var p = plan(rec.plan), sp = "";
    if (p.vip) for (var i = 0; i < 6; i++) sp += '<i style="--x:' + (8 + i * 17) + '%;--y:' + (i % 2 ? 22 : 70) + '%;--dl:' + (i * .45) + 's">✦</i>';
    return '<div class="rq-ticket plan-' + p.id + '" style="' + vars(p) + '"><span class="tk-lab">' + (rec.kind === "c" ? rt("cp.done.no") : rt("done.no")) + '</span><div class="tk-row"><span class="tk-no" id="tkNo">' + esc(rec.no) + '</span><span class="tk-plan">' + ICON[p.id] + planLabel(p.id) + "</span></div>" + (p.vip ? '<p class="tk-vip">' + (rec.kind === "c" ? rt("cp.vip") : rt("vip")) + "</p>" : "") + (rec.kind === "c" && rec.cat ? '<p class="tk-cat">' + esc(rec.cat) + "</p>" : "") + '<span class="tk-sp" aria-hidden="true">' + sp + "</span></div>";
  }
  function doneHtml() {
    var rec = RQ.rec, p = plan(rec.plan), first = (rec.name || "").trim().split(/\s+/)[0] || "";
    var steps = rt("steps").map(function (s) { return "<li><span>" + s + "</span></li>"; }).join("");
    return '<div class="rq-done plan-' + p.id + '" style="' + vars(p) + '"><svg class="rq-check" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27"/><path d="M20 33l8 8 17-18"/></svg>' +
      '<h2 class="rq-title title-gradient rainbow" id="rqTitle">' + rt("done.hi", { n: esc(first) }) + '</h2><p class="rq-sub">' + rt("done.p") + "</p>" + ticketHtml(rec) +
      '<h3 class="rq-h3">' + rt("done.h") + '</h3><ol class="rq-steps">' + steps + "</ol>" +
      '<div class="rq-actions" style="width:100%"><a class="btn btn-primary" id="rqWa" href="' + esc(waBase() + "?text=" + encodeURIComponent(RQ.msg)) + '" target="_blank" rel="noopener">' + rt("wa") + '</a><button class="btn btn-ghost" type="button" id="rqCopy">' + rt("copy") + '</button><button class="btn btn-ghost" type="button" data-open-track="' + esc(rec.no) + '">' + rt("track") + '</button><button class="btn btn-ghost" type="button" data-close>' + rt("back") + "</button></div></div>";
  }
  function rqRender() {
    if (!rq) return;
    rqIn.innerHTML = RQ.view === "done" ? doneHtml() : formHtml();
    var x = q(".rq-x", rq); if (x) x.setAttribute("aria-label", rt("close"));
    rq.setAttribute("dir", lng() === "en" ? "ltr" : "rtl");
    var d = q(".rq-dialog", rq); if (d) d.scrollTop = 0;
  }
  function openRequest() {
    if (!rq) return;
    rqLast = doc.activeElement;
    if (RQ.view === "done") { RQ.view = "form"; RQ.d = BLANK(); RQ.rec = null; }
    RQ.alert = false; rqRender(); rq.hidden = false; lock(true);
    setTimeout(function () { var f = q("#rq-name"); if (f) f.focus(); }, 80);
  }
  function closeRequest() {
    if (!rq || rq.hidden) return;
    rq.hidden = true; lock(false);
    if (rqLast && rqLast.focus) { try { rqLast.focus(); } catch (e) {} }
  }
  function markBad(root, key, msgKey) {
    var box = q('[data-box="' + key + '"]', root); if (!box) return null;
    box.classList.add("bad"); shake(box);
    var er = q(".rq-err", box); if (er) er.textContent = rt(msgKey);
    return box;
  }
  function submitRequest() {
    var d = RQ.d, bad = [];
    qa(".rq-f.bad", rqIn).forEach(function (b) { b.classList.remove("bad"); var e = q(".rq-err", b); if (e) e.textContent = ""; });
    if (d.name.trim().length < 2) bad.push(markBad(rqIn, "name", "err.name"));
    if (digits(d.phone).length < 8) bad.push(markBad(rqIn, "phone", "err.phone"));
    if (!EMAIL.test(d.email.trim())) bad.push(markBad(rqIn, "email", "err.email"));
    if (!d.type) bad.push(markBad(rqIn, "type", "err.type"));
    else if (d.type === "other" && d.other.trim().length < 2) bad.push(markBad(rqIn, "other", "err.other"));
    bad = bad.filter(Boolean);
    if (bad.length) {
      var al = q(".rq-alert", rqIn);
      if (!al) { al = doc.createElement("div"); al.className = "rq-alert"; al.setAttribute("role", "alert"); al.textContent = rt("alert"); q(".rq-actions", rqIn).insertAdjacentElement("beforebegin", al); } else shake(al);
      try { if (navigator.vibrate) navigator.vibrate([40, 30, 40]); } catch (e) {}
      var inp = q("input,select", bad[0]); if (inp) inp.focus();
      return;
    }
    var p = plan(d.plan), no = "TU-" + p.code + "-" + (10000 + Math.floor(Math.random() * 89999));
    var typeName = d.type === "other" ? d.other.trim() : rt("types")[+d.type], countName = d.count === "" ? "" : rt("counts")[+d.count], L = rt("msg.l");
    RQ.rec = { no: no, plan: p.id, name: d.name.trim(), ts: Date.now(), sent: 0, lang: lng() };
    RQ.msg = [L[0], L[1] + ": " + no, L[2] + ": " + rt("plan." + p.id + ".n"), L[3] + ": " + d.name.trim(), d.biz.trim() && L[4] + ": " + d.biz.trim(), L[5] + ": " + typeName, countName && L[6] + ": " + countName, L[7] + ": " + d.phone.trim(), L[8] + ": " + d.email.trim(), d.note.trim() && L[9] + ": " + d.note.trim()].filter(Boolean).join("\n");
    saveRec(RQ.rec); paintChip();
    RQ.view = "done"; rqRender();
    var t = q("#tkNo", rqIn), r = t ? t.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 3, width: 0 };
    var C = p.id === "g" ? ["#ffe08a", "#ffc857", "#ff9f1c", "#fff3c4", "#ffffff"] : p.id === "s" ? ["#eef3fb", "#cbd6e8", "#9fb1cc", "#ffffff", "#7f93b3"] : ["#f0b07a", "#e8a06a", "#b9693a", "#ffd9bd", "#ffffff"];
    confetti(r.left + r.width / 2, r.top + 30, p.id === "g" ? 150 : 90, 15, C);
  }
  if (rq) {
    trap(rq);
    rqIn.addEventListener("input", function (e) {
      var f = e.target.getAttribute && e.target.getAttribute("data-f"); if (!f) return;
      RQ.d[f] = e.target.value;
      var box = e.target.closest(".rq-f"); if (box && box.classList.contains("bad")) { box.classList.remove("bad", "shake"); var er = q(".rq-err", box); if (er) er.textContent = ""; }
    });
    rqIn.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "rqPlan") { RQ.d.plan = t.value; qa(".plan", rqIn).forEach(function (l) { l.classList.toggle("on", q("input", l).checked); }); return; }
      if (t.getAttribute("data-f") === "type") {
        var ob = q(".rq-other", rqIn); if (ob) { ob.classList.toggle("open", t.value === "other"); if (t.value === "other") { var oi = q("input", ob); setTimeout(function () { oi.focus(); }, 60); } else { ob.classList.remove("bad"); var e2 = q(".rq-err", ob); if (e2) e2.textContent = ""; } }
      }
    });
    rqIn.addEventListener("submit", function (e) { e.preventDefault(); submitRequest(); });
    rqIn.addEventListener("click", function (e) {
      if (e.target.closest("#rqWa") && RQ.rec) { RQ.rec.sent = Date.now(); saveRec(RQ.rec); return; }
      var c = e.target.closest("#rqCopy");
      if (c) {
        var done = function () { var o = c.textContent; c.textContent = rt("copied"); setTimeout(function () { c.textContent = o; }, 1600); };
        var fb = function () { var r = doc.createRange(); r.selectNodeContents(q("#tkNo", rqIn)); var s = getSelection(); s.removeAllRanges(); s.addRange(r); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(RQ.rec.no).then(done, fb); else fb();
      }
    });
  }

  /* ---- complaints ---- */
  Object.assign(RT.ar, {
    "cp.eye": "شكوى جديدة", "cp.title": "قدّم شكوى", "cp.sub": "احكي لنا إيه اللي حصل بالتفصيل، وهنراجعه ونرجع لك بحل.",
    "cp.cats": ["تأخير في التسليم", "جودة الشغل", "الفواتير والدفعات", "الإعلانات والنتائج", "التواصل مع الفريق"], "cp.cat.other": "حاجة تانية (هكتبها)",
    "cp.f.cat": "نوع الشكوى", "cp.f.other": "اكتب نوع الشكوى", "cp.f.plan": "إنت عميل باقة إيه؟", "cp.f.urg": "الشكوى مستعجلة قد إيه؟", "cp.f.desc": "احكي لنا إيه اللي حصل", "cp.noplan": "معنديش باقة", "cp.ph.desc": "اكتب التفاصيل: إيه اللي حصل، ومتى، وإيه اللي كنت متوقعه…",
    "cp.urg": ["عادية", "مستعجلة", "مستعجلة جداً"], "cp.linked": "الشكوى هتتربط بطلبك {no} وتتراجع بأولوية باقتك.", "cp.unlink": "مش طلبي",
    "cp.err.cat": "اختار نوع الشكوى.", "cp.err.other": "اكتب نوع الشكوى.", "cp.err.desc": "اكتب تفاصيل الشكوى (10 حروف على الأقل).", "cp.err.email": "الإيميل ده مش مظبوط، راجعه أو سيبه فاضي.",
    "cp.send": "ابعت الشكوى", "cp.fine": "شكواك بتروح لمدير مسؤول، ومبتتقفلش غير لما تتحل.",
    "cp.done.hi": "آسفين على اللي حصل، وشكراً إنك قلتلنا يا {n}", "cp.done.p": "وصلتنا شكواك. ده رقمها، وكل متابعة هتبقى بيه.", "cp.done.no": "رقم شكواك", "cp.done.h": "إيه اللي تعمله بالرقم ده؟",
    "cp.steps": ["<b>احتفظ بالرقم ده.</b> هو مرجعك لأي متابعة، واتحفظ في متصفحك كمان.", "دوس <b>«ابعت الشكوى على واتساب»</b> تحت علشان توصل لفريق الشكاوى فوراً.", "قول لنا <b>باقتك ورقم شكواك</b> وإحنا نفتحلك الملف على طول.", "تابع شكواك من أي قسم: دوس <b>«تتبّع طلبك»</b> واكتب الرقم.", "هنتواصل معاك بالحل، ولو حاجة لسه مش تمام قولنا نعيد فتحها."],
    "cp.vip": "شكوى VIP: بتتراجع قبل أي شكوى تانية.", "cp.wa": "ابعت الشكوى على واتساب",
    "cp.msg.l": ["شكوى جديدة في TaskUp", "رقم الشكوى", "الباقة", "الاستعجال", "النوع", "الاسم", "الموبايل", "الإيميل", "رقم الطلب", "التفاصيل"],
    "cp.msg.ask": "أنا صاحب الشكوى رقم {no} ({p}). عايز أعرف وصلت لفين.",
    "cp.tl": [["الشكوى اتسجّلت", "{t}"], ["الشكوى اتبعتت لفريق الشكاوى", ""], ["مدير مسؤول بيراجعها", "هنتواصل معاك على موبايلك"], ["بنجهّز الحل", "هنعرضه عليك ونتفق عليه"], ["الشكوى اتحلّت", "ولو لسه مش تمام نعيد فتحها"]],
    "plan.n.l": "شكوى عامة", "plan.n.n": "عامة", "ctx.n": "بدون باقة"
  });
  Object.assign(RT.en, {
    "cp.eye": "New complaint", "cp.title": "Submit a complaint", "cp.sub": "Tell us what happened in detail, and we'll review it and come back with a fix.",
    "cp.cats": ["Late delivery", "Quality of work", "Invoices and payments", "Ads and results", "Communication with the team"], "cp.cat.other": "Something else (I'll type it)",
    "cp.f.cat": "Type of complaint", "cp.f.other": "Describe the type", "cp.f.plan": "Which plan are you on?", "cp.f.urg": "How urgent is it?", "cp.f.desc": "Tell us what happened", "cp.noplan": "I don't have a plan", "cp.ph.desc": "Write the details: what happened, when, and what you expected…",
    "cp.urg": ["Normal", "Urgent", "Very urgent"], "cp.linked": "Your complaint will be linked to your request {no} and handled with your plan's priority.", "cp.unlink": "Not mine",
    "cp.err.cat": "Please choose the type of complaint.", "cp.err.other": "Please describe the type.", "cp.err.desc": "Please add the details (at least 10 characters).", "cp.err.email": "That email doesn't look right. Check it or leave it empty.",
    "cp.send": "Send complaint", "cp.fine": "Your complaint goes to a responsible manager and isn't closed until it's resolved.",
    "cp.done.hi": "We're sorry, and thank you for telling us, {n}", "cp.done.p": "We've received your complaint. This is its number, and every follow-up will use it.", "cp.done.no": "Your complaint number", "cp.done.h": "What to do with this number",
    "cp.steps": ["<b>Keep this number.</b> It's your reference for any follow-up, and we've saved it in your browser too.", "Press <b>“Send complaint on WhatsApp”</b> below so it reaches the complaints team right away.", "Tell us <b>your plan and your complaint number</b> and we'll open your file straight away.", "Follow your complaint from any section: press <b>“Track your request”</b> and enter the number.", "We'll contact you with the fix, and if something still isn't right, tell us and we'll reopen it."],
    "cp.vip": "VIP complaint: handled before any other complaint.", "cp.wa": "Send complaint on WhatsApp",
    "cp.msg.l": ["New complaint, TaskUp", "Complaint number", "Plan", "Urgency", "Type", "Name", "Mobile", "Email", "Request number", "Details"],
    "cp.msg.ask": "I'm the owner of complaint {no} ({p}). I'd like to know where it stands.",
    "cp.tl": [["Complaint registered", "{t}"], ["Complaint sent to the complaints team", ""], ["A responsible manager reviews it", "We'll contact you on your mobile"], ["We prepare the fix", "We'll present it and agree on it with you"], ["Complaint resolved", "And if it still isn't right, we reopen it"]],
    "plan.n.l": "General complaint", "plan.n.n": "General", "ctx.n": "No plan"
  });
  var cpm = q("#cpModal"), cpIn = q("#cpInner"), cpLast = null, CATS = ["late", "quality", "billing", "ads", "comm"];
  var CBLANK = function () { return { name: "", phone: "", email: "", cat: "", other: "", urg: "0", plan: "n", desc: "" }; };
  var CP = { view: "form", d: CBLANK(), rec: null, msg: "", alert: false, linked: null };
  function cpFormHtml() {
    var d = CP.d, cats = rt("cp.cats"), urg = rt("cp.urg"), i, cO = '<option value="">' + rt("ph.select") + "</option>";
    for (i = 0; i < cats.length; i++) cO += '<option value="' + CATS[i] + '"' + (d.cat === CATS[i] ? " selected" : "") + ">" + cats[i] + "</option>";
    cO += '<option value="other"' + (d.cat === "other" ? " selected" : "") + ">" + rt("cp.cat.other") + "</option>";
    var urgHtml = urg.map(function (u, k) { return '<label class="urg u' + k + (d.urg === String(k) ? " on" : "") + '"><input type="radio" name="cpUrg" value="' + k + '"' + (d.urg === String(k) ? " checked" : "") + "><span>" + u + "</span></label>"; }).join("");
    var lk = CP.linked, pOpts = ["n", "b", "s", "g"].map(function (id) { return '<option value="' + id + '"' + (d.plan === id ? " selected" : "") + ">" + (id === "n" ? rt("cp.noplan") : rt("plan." + id + ".n")) + "</option>"; }).join("");
    var link = lk ? '<div class="rq-f wide cp-link" style="' + vars(plan(lk.plan)) + '"><div class="cp-linked"><span class="tk-plan">' + ICON[lk.plan] + planLabel(lk.plan) + "</span><span>" + rt("cp.linked", { no: esc(lk.no) }) + '</span><button type="button" class="cp-unlink" data-act="unlink">' + rt("cp.unlink") + "</button></div></div>"
      : field("plan", rt("cp.f.plan"), '<select id="cp-plan" data-f="plan">' + pOpts + "</select>", { wide: 1 });
    return '<div class="rq-body"><span class="eyebrow">' + rt("cp.eye") + '</span><h2 class="rq-title title-gradient rainbow" id="cpTitle">' + rt("cp.title") + '</h2><p class="rq-sub">' + rt("cp.sub") + "</p>" +
      '<form id="cpFormEl" novalidate>' +
      field("name", rt("f.name"), '<input id="cp-name" data-f="name" autocomplete="name" value="' + esc(d.name) + '" placeholder="' + esc(rt("ph.name")) + '">', { req: 1 }) +
      field("phone", rt("f.phone"), '<input id="cp-phone" data-f="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" value="' + esc(d.phone) + '" placeholder="01xxxxxxxxx">', { req: 1 }) +
      field("email", rt("f.email"), '<input id="cp-email" data-f="email" type="email" autocomplete="email" dir="ltr" value="' + esc(d.email) + '" placeholder="' + esc(rt("ph.email")) + '">') +
      field("cat", rt("cp.f.cat"), '<select id="cp-cat" data-f="cat">' + cO + "</select>", { req: 1 }) +
      field("other", rt("cp.f.other"), '<input id="cp-other" data-f="other" value="' + esc(d.other) + '" placeholder="' + esc(rt("ph.other")) + '">', { req: 1, wide: 1, cls: "rq-other" + (d.cat === "other" ? " open" : "") }) +
      link +
      '<fieldset class="rq-f wide cp-urgs"><legend>' + rt("cp.f.urg") + '</legend><div class="urgs">' + urgHtml + "</div></fieldset>" +
      field("desc", rt("cp.f.desc"), '<textarea id="cp-desc" data-f="desc" rows="4" placeholder="' + esc(rt("cp.ph.desc")) + '">' + esc(d.desc) + "</textarea>", { req: 1, wide: 1 }) +
      '<div class="rq-actions"><button class="btn btn-primary" type="submit">' + rt("cp.send") + '</button><p class="rq-fine">' + rt("cp.fine") + "</p></div></form></div>";
  }
  function cpDoneHtml() {
    var rec = CP.rec, p = plan(rec.plan), first = (rec.name || "").trim().split(/\s+/)[0] || "";
    var steps = rt("cp.steps").map(function (s) { return "<li><span>" + s + "</span></li>"; }).join("");
    return '<div class="rq-done plan-' + p.id + '" style="' + vars(p) + '"><svg class="rq-check" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27"/><path d="M20 33l8 8 17-18"/></svg>' +
      '<h2 class="rq-title title-gradient rainbow" id="cpTitle">' + rt("cp.done.hi", { n: esc(first) }) + '</h2><p class="rq-sub">' + rt("cp.done.p") + "</p>" + ticketHtml(rec) +
      '<h3 class="rq-h3">' + rt("cp.done.h") + '</h3><ol class="rq-steps">' + steps + "</ol>" +
      '<div class="rq-actions" style="width:100%"><a class="btn btn-primary" id="cpWa" href="' + esc(waBase() + "?text=" + encodeURIComponent(CP.msg)) + '" target="_blank" rel="noopener">' + rt("cp.wa") + '</a><button class="btn btn-ghost" type="button" id="cpCopy">' + rt("copy") + '</button><button class="btn btn-ghost" type="button" data-open-track="' + esc(rec.no) + '">' + rt("track") + '</button><button class="btn btn-ghost" type="button" data-close>' + rt("back") + "</button></div></div>";
  }
  function cpRender() {
    if (!cpm) return;
    cpIn.innerHTML = CP.view === "done" ? cpDoneHtml() : cpFormHtml();
    var x = q(".rq-x", cpm); if (x) x.setAttribute("aria-label", rt("close"));
    cpm.setAttribute("dir", lng() === "en" ? "ltr" : "rtl");
    var d = q(".rq-dialog", cpm); if (d) d.scrollTop = 0;
  }
  function openComplaint(cat) {
    if (!cpm) return;
    cpLast = doc.activeElement;
    if (CP.view === "done") { CP.view = "form"; CP.d = CBLANK(); CP.rec = null; }
    var lastReq = loadRecs().filter(function (r) { return r.kind !== "c"; })[0];
    CP.linked = lastReq || null; if (lastReq) CP.d.plan = lastReq.plan;
    if (cat && (CATS.indexOf(cat) > -1 || cat === "other")) CP.d.cat = cat;
    if (lastReq && !CP.d.name) CP.d.name = lastReq.name || "";
    CP.alert = false; cpRender(); cpm.hidden = false; lock(true);
    setTimeout(function () { var f = q(CP.d.name ? "#cp-phone" : "#cp-name"); if (f) f.focus(); }, 80);
  }
  function closeComplaint() {
    if (!cpm || cpm.hidden) return;
    cpm.hidden = true; lock(false);
    if (cpLast && cpLast.focus) { try { cpLast.focus(); } catch (e) {} }
  }
  function submitComplaint() {
    var d = CP.d, bad = [];
    qa(".rq-f.bad", cpIn).forEach(function (b) { b.classList.remove("bad"); var e = q(".rq-err", b); if (e) e.textContent = ""; });
    if (d.name.trim().length < 2) bad.push(markBad(cpIn, "name", "err.name"));
    if (digits(d.phone).length < 8) bad.push(markBad(cpIn, "phone", "err.phone"));
    if (d.email.trim() && !EMAIL.test(d.email.trim())) bad.push(markBad(cpIn, "email", "cp.err.email"));
    if (!d.cat) bad.push(markBad(cpIn, "cat", "cp.err.cat"));
    else if (d.cat === "other" && d.other.trim().length < 2) bad.push(markBad(cpIn, "other", "cp.err.other"));
    if (d.desc.trim().length < 10) bad.push(markBad(cpIn, "desc", "cp.err.desc"));
    bad = bad.filter(Boolean);
    if (bad.length) {
      var al = q(".rq-alert", cpIn);
      if (!al) { al = doc.createElement("div"); al.className = "rq-alert"; al.setAttribute("role", "alert"); al.textContent = rt("alert"); q(".rq-actions", cpIn).insertAdjacentElement("beforebegin", al); } else shake(al);
      try { if (navigator.vibrate) navigator.vibrate([40, 30, 40]); } catch (e) {}
      var inp = q("input,select,textarea", bad[0]); if (inp) inp.focus();
      return;
    }
    var pid = CP.linked ? CP.linked.plan : d.plan, p = plan(pid), no = "CP-" + p.code + "-" + (10000 + Math.floor(Math.random() * 89999));
    var catName = d.cat === "other" ? d.other.trim() : rt("cp.cats")[CATS.indexOf(d.cat)], urgName = rt("cp.urg")[+d.urg], L = rt("cp.msg.l");
    CP.rec = { kind: "c", no: no, plan: p.id, name: d.name.trim(), ts: Date.now(), sent: 0, lang: lng(), cat: catName, link: CP.linked ? CP.linked.no : "" };
    CP.msg = [L[0], L[1] + ": " + no, L[2] + ": " + (p.id === "n" ? rt("cp.noplan") : rt("plan." + p.id + ".n")), L[3] + ": " + urgName, L[4] + ": " + catName, L[5] + ": " + d.name.trim(), L[6] + ": " + d.phone.trim(), d.email.trim() && L[7] + ": " + d.email.trim(), CP.linked && L[8] + ": " + CP.linked.no, L[9] + ":\n" + d.desc.trim()].filter(Boolean).join("\n");
    saveRec(CP.rec); paintChip();
    CP.view = "done"; cpRender();
  }
  if (cpm) {
    trap(cpm);
    cpIn.addEventListener("input", function (e) {
      var f = e.target.getAttribute && e.target.getAttribute("data-f"); if (!f) return;
      CP.d[f] = e.target.value;
      var box = e.target.closest(".rq-f"); if (box && box.classList.contains("bad")) { box.classList.remove("bad", "shake"); var er = q(".rq-err", box); if (er) er.textContent = ""; }
    });
    cpIn.addEventListener("change", function (e) {
      var t = e.target;
      if (t.name === "cpUrg") { CP.d.urg = t.value; qa(".urg", cpIn).forEach(function (l) { l.classList.toggle("on", q("input", l).checked); }); return; }
      if (t.getAttribute("data-f") === "cat") {
        var ob = q(".rq-other", cpIn); if (ob) { ob.classList.toggle("open", t.value === "other"); if (t.value === "other") { var oi = q("input", ob); setTimeout(function () { oi.focus(); }, 60); } else { ob.classList.remove("bad"); var e2 = q(".rq-err", ob); if (e2) e2.textContent = ""; } }
      }
    });
    cpIn.addEventListener("submit", function (e) { e.preventDefault(); submitComplaint(); });
    cpIn.addEventListener("click", function (e) {
      if (e.target.closest('[data-act="unlink"]')) { CP.linked = null; CP.d.plan = "n"; cpRender(); return; }
      if (e.target.closest("#cpWa") && CP.rec) { CP.rec.sent = Date.now(); saveRec(CP.rec); return; }
      var c = e.target.closest("#cpCopy");
      if (c) {
        var done = function () { var o = c.textContent; c.textContent = rt("copied"); setTimeout(function () { c.textContent = o; }, 1600); };
        var fb = function () { var r = doc.createRange(); r.selectNodeContents(q("#tkNo", cpIn)); var s = getSelection(); s.removeAllRanges(); s.addRange(r); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(CP.rec.no).then(done, fb); else fb();
      }
    });
  }

  /* ---- tracking dialog ---- */
  var trm = q("#trModal"), trIn = q("#trInner"), trLast = null, TR = { no: "", rec: null, tried: false, err: false };
  function trResult() {
    if (TR.rec) {
      var r = TR.rec, p = plan(r.plan), tl = rt(r.kind === "c" ? "cp.tl" : "tl"), st = ["d", r.sent ? "d" : "n", r.sent ? "n" : "x", "x", "x"];
      var items = tl.map(function (s, i) {
        var sub = i === 0 ? s[1].replace("{t}", fmtTime(r.ts)) : i === 1 ? (r.sent ? rt("tl.sent", { t: fmtTime(r.sent) }) : rt("tl.nosent")) : s[1];
        return '<li class="' + st[i] + '"><i></i><div><b>' + s[0] + "</b><small>" + sub + "</small></div></li>";
      }).join("");
      var ask = waBase() + "?text=" + encodeURIComponent(rt(r.kind === "c" ? "cp.msg.ask" : "msg.ask", { no: r.no, p: p.id === "n" ? rt("cp.noplan") : rt("plan." + p.id + ".n") }));
      return '<div style="width:100%;' + vars(p).replace(/--/g, "--") + '">' + ticketHtml(r) + '<ol class="tl" style="' + vars(p) + '">' + items + '</ol><p class="rq-fine" style="margin-top:.8rem">' + rt("tr.note") + '</p><div class="rq-actions" style="margin-top:.6rem"><a class="btn btn-primary" target="_blank" rel="noopener" href="' + esc(ask) + '">' + rt("tr.ask") + "</a></div></div>";
    }
    if (TR.tried) {
      var ask2 = waBase() + "?text=" + encodeURIComponent(rt("msg.ask", { no: TR.no, p: "—" }));
      return '<div class="rq-nf"><p>' + rt("tr.nf") + '</p><a class="btn btn-primary" target="_blank" rel="noopener" href="' + esc(ask2) + '">' + rt("tr.ask") + "</a></div>";
    }
    return "";
  }
  function trRender() {
    if (!trm) return;
    trIn.innerHTML = '<div class="rq-body"><span class="eyebrow">' + rt("tr.lab") + '</span><h2 class="rq-title title-gradient rainbow" id="trTitle">' + rt("tr.t") + '</h2><p class="rq-sub">' + rt("tr.p") + "</p>" +
      '<form class="tr-form" id="trForm" novalidate><div class="rq-f' + (TR.err ? " bad" : "") + '" data-box="tr"><label for="trNo">' + rt("tr.lab") + '</label><input id="trNo" dir="ltr" autocomplete="off" autocapitalize="characters" placeholder="' + esc(rt("tr.ph")) + '" value="' + esc(TR.no) + '"><span class="rq-err" role="alert">' + (TR.err ? rt("tr.err") : "") + '</span></div><button class="btn btn-primary" type="submit">' + rt("tr.go") + "</button></form>" + '<div id="trOut" style="width:100%">' + trResult() + "</div></div>";
    var x = q(".rq-x", trm); if (x) x.setAttribute("aria-label", rt("close"));
    trm.setAttribute("dir", lng() === "en" ? "ltr" : "rtl");
  }
  function openTrack(no) {
    if (!trm) return;
    trLast = doc.activeElement;
    var first = loadRecs()[0];
    TR.no = no || (first ? first.no : ""); TR.err = false; TR.rec = TR.no ? findRec(TR.no) : null; TR.tried = !!TR.no && !TR.rec;
    trRender(); trm.hidden = false; lock(true);
    setTimeout(function () { var f = q("#trNo"); if (f && !TR.rec) f.focus(); }, 80);
  }
  function closeTrack() {
    if (!trm || trm.hidden) return;
    trm.hidden = true; lock(false);
    if (trLast && trLast.focus) { try { trLast.focus(); } catch (e) {} }
  }
  if (trm) {
    trap(trm);
    trIn.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = q("#trNo").value.trim();
      if (!v) { TR.err = true; TR.no = ""; TR.rec = null; TR.tried = false; trRender(); var b = q('[data-box="tr"]', trIn); shake(b); q("#trNo").focus(); return; }
      TR.no = v.toUpperCase(); TR.err = false; TR.rec = findRec(v); TR.tried = !TR.rec; trRender();
      if (TR.rec) { var p = plan(TR.rec.plan); confetti(innerWidth / 2, innerHeight / 3, 40, 9, [p.c1, p.c2, "#ffffff"]); }
    });
  }
  paintChip();

  /* ===================================================== portal dictionary (Arabic = Egyptian colloquial) */
  var PT = {
    ar: {
      "login.title": "أهلاً بيك في بوابتك", "login.sub": "اكتب كود مشروعك وهنوريك وصلنا لفين بالظبط.",
      "login.code": "كود المشروع", "login.pin": "رمز الدخول", "login.go": "ادخل", "login.demo": "جرّب بحساب تجريبي",
      "login.noacc": "لسه معندكش حساب؟", "login.req": "قدّم طلب فتح حساب", "login.track": "عندك رقم طلب؟ تتبّعه", "login.isreq": "ده رقم طلب مش كود مشروع. فتحنالك صفحة تتبّع الطلب.",
      "login.errEmpty": "اكتب الكود والرمز الأول.", "login.errBad": "الكود ده مش متسجّل عندنا. جرّب الحساب التجريبي أو قدّم طلب فتح حساب.",
      "fl1": "تصميم اتعتمد", "fl1s": "صفحة المنتج", "fl2": "المشروع وصل", "fl2s": "72% خلص", "fl3": "دفعة وصلت", "fl3s": "52,300 ج.م", "fl4": "إعلاناتك", "fl4s": "كل جنيه رجّع 4.2",
      "top.logout": "خروج", "top.close": "رجوع للموقع", "top.req": "قدّم طلب فتح حساب", "top.reqs": "قدّم طلب", "top.lang": "EN",
      "splash.hi": "أهلاً يا {n}", "splash.p": "بنجهّز لك مشروعك…",
      "hello.m": "صباح الخير يا {n}", "hello.d": "أهلاً يا {n}", "hello.e": "مساء الخير يا {n}",
      "sum.some": "كل حاجة ماشية تمام. الفريق شغال دلوقتي على <b>{stage}</b>، وفاضل <b>{w}</b> موافقتك.",
      "sum.none": "كل حاجة ماشية تمام. الفريق شغال دلوقتي على <b>{stage}</b>، ومفيش حاجة مطلوبة منك. ريّح بالك.",
      "demo.note": "ده حساب تجريبي. كده بالظبط هتشوف مشروعك لما نفتحلك حسابك.", "demo.cta": "قدّم طلب فتح حساب",
      "hero.done": "اتخلّص", "hero.proj": "موقع وتطبيق متجر نور", "hero.ok": "ماشي في الميعاد", "hero.eta": "التسليم المتوقع", "hero.left": "فاضل", "hero.days": "{n} يوم", "hero.now": "شغالين على", "hero.team": "فريقك",
      "j.title": "وصلنا لفين؟", "j.sub": "اضغط على أي مرحلة وشوف إيه اللي حصل فيها.",
      "st.d": "خلصت", "st.c": "شغالين عليها دلوقتي", "st.n": "جاية",
      "s1.n": "اتفقنا", "s1.d": "حددنا الهدف والميزانية والمواعيد.", "s2.n": "التصميم", "s2.d": "رسمنا شكل الموقع والتطبيق وانت وافقت عليه.",
      "s3.n": "بناء الصفحات", "s3.d": "بنبني الصفحات والدفع ولوحة الطلبات.", "s4.n": "مراجعتك", "s4.d": "بتجرّب بنفسك وتقول لنا أي تعديل.", "s5.n": "الإطلاق", "s5.d": "بننزّل المشروع ويبقى لايف قدام الناس.",
      "t1a": "اجتماع الاتفاق", "t1b": "تحديد الميزانية", "t1c": "جدول المواعيد",
      "t2a": "الألوان والخطوط", "t2b": "تصميم الصفحة الرئيسية", "t2c": "تصميم صفحة المنتج",
      "t3a": "الصفحة الرئيسية", "t3b": "سلة المشتريات", "t3c": "صفحة الدفع", "t3d": "لوحة الطلبات",
      "t4a": "تجربتك للموقع", "t4b": "تعديلاتك وملاحظاتك", "t5a": "ربط الدومين", "t5b": "النشر والإعلان",
      "tk.d": "خلصت", "tk.n": "شغالين", "tk.t": "لسه", "det.t": "إيه اللي في مرحلة «{s}»",
      "ap.t": "محتاجين منك", "ap.s": "حاجتين صغيرين بس، وبعدها نكمّل على طول.",
      "ap.a1": "تصميم صفحة المنتج", "ap.a1d": "بصّ على الشكل وقولنا رأيك. لو تمام هنكمّل عليه.",
      "ap.a2": "كلام صفحة «من نحن»", "ap.a2d": "راجع الكلام ده، ولو عاجبك وافق عليه.",
      "ap.yes": "تمام، موافق", "ap.edit": "عايز أعدّل حاجة", "ap.okr": "موافق. شكراً! الفريق كمّل شغل.", "ap.chr": "بعتنا ملاحظتك للفريق، هيرجعوا لك بالتعديل.",
      "ap.e": "مفيش حاجة مطلوبة منك دلوقتي", "ap.es": "كل حاجة اتراجعت. هنبلغك أول ما نحتاجك.",
      "pay.t": "الدفعات", "pay.s": "فلوسك ماشية مع شغلك، خطوة بخطوة.", "pay.of": "من", "pay.p": "اتدفع",
      "pay.i1": "عند بداية الشغل", "pay.i2": "بعد اعتماد التصميم", "pay.i3": "في منتصف البناء", "pay.i4": "قبل الإطلاق",
      "pay.paid": "اتدفعت", "pay.due": "بعد {n} أيام", "pay.btn": "ادفع الدفعة الجاية", "pay.toast": "ده حساب تجريبي. الدفع الحقيقي بيتفعّل مع حسابك.", "cur": "ج.م",
      "ads.t": "إعلاناتك", "ads.s": "آخر 14 يوم", "ads.spend": "صرفنا", "ads.orders": "طلبات جت", "ads.roas": "كل جنيه رجّع", "ads.roasv": "{n} جنيه",
      "fd.t": "آخر الأخبار", "f1": "الفريق خلّص سلة المشتريات", "f1t": "من ساعتين", "f2": "بعتنالك تصميم صفحة المنتج تراجعه", "f2t": "من 5 ساعات",
      "f3": "وصلتنا الدفعة التالتة. شكراً ليك", "f3t": "إمبارح", "f4": "إعلاناتك رجّعت 4.2 جنيه لكل جنيه اتصرف", "f4t": "إمبارح", "f5": "اتفقنا على معاد الإطلاق", "f5t": "من 3 أيام",
      "ch.t": "كلّم الفريق", "ch.s": "اسأل عن أي حاجة، والفريق يرد عليك.", "m1": "أهلاً يا {n}! لو عندك أي سؤال اكتبه هنا وهنرد عليك.",
      "q1": "المعاد لسه زي ما هو؟", "q2": "عايز أعدّل حاجة", "q3": "محتاج أتكلم مع حد", "ch.ph": "اكتب اللي في بالك…", "ch.send": "ابعت", "ch.cp": "مش راضي عن حاجة؟", "ch.cpb": "قدّم شكوى",
      "ch.reply": "وصلتنا رسالتك! (ده حساب تجريبي، فمش بتروح لحد. في حسابك الحقيقي بتوصل لمدير مشروعك على طول.)", "now": "دلوقتي", "name": "كريم", "stage": "بناء الصفحات"
    },
    en: {
      "login.title": "Welcome to your portal", "login.sub": "Enter your project code and we'll show you exactly where things stand.",
      "login.code": "Project code", "login.pin": "Access PIN", "login.go": "Sign in", "login.demo": "Try the demo account",
      "login.noacc": "Don't have an account yet?", "login.req": "Request an account", "login.track": "Have a request number? Track it", "login.isreq": "That is a request number, not a project code. We opened request tracking for you.",
      "login.errEmpty": "Please enter both the code and the PIN.", "login.errBad": "We don't recognise that code. Try the demo account or request an account.",
      "fl1": "Design approved", "fl1s": "Product page", "fl2": "Project progress", "fl2s": "72% done", "fl3": "Payment received", "fl3s": "EGP 52,300", "fl4": "Your ads", "fl4s": "4.2 back per 1 spent",
      "top.logout": "Sign out", "top.close": "Back to site", "top.req": "Request an account", "top.reqs": "Apply", "top.lang": "عربي",
      "splash.hi": "Welcome, {n}", "splash.p": "Getting your project ready…",
      "hello.m": "Good morning, {n}", "hello.d": "Hi, {n}", "hello.e": "Good evening, {n}",
      "sum.some": "Everything is on track. The team is working on <b>{stage}</b>, and <b>{w}</b> your approval.",
      "sum.none": "Everything is on track. The team is working on <b>{stage}</b>, and nothing is needed from you right now. Relax.",
      "demo.note": "This is a demo account. It's exactly what you'll see for your own project once your account is open.", "demo.cta": "Request an account",
      "hero.done": "complete", "hero.proj": "Noor Store website & app", "hero.ok": "On schedule", "hero.eta": "Expected delivery", "hero.left": "Time left", "hero.days": "{n} days", "hero.now": "Working on", "hero.team": "Your team",
      "j.title": "Where are we?", "j.sub": "Tap any stage to see what happened in it.",
      "st.d": "Done", "st.c": "In progress now", "st.n": "Coming up",
      "s1.n": "Kickoff", "s1.d": "We agreed on goals, budget and dates.", "s2.n": "Design", "s2.d": "We designed the site and app, and you approved it.",
      "s3.n": "Building pages", "s3.d": "We're building the pages, checkout and orders panel.", "s4.n": "Your review", "s4.d": "You try it yourself and tell us what to tweak.", "s5.n": "Launch", "s5.d": "We publish it and it goes live for everyone.",
      "t1a": "Kickoff meeting", "t1b": "Budget agreed", "t1c": "Timeline set",
      "t2a": "Colours & fonts", "t2b": "Home page design", "t2c": "Product page design",
      "t3a": "Home page", "t3b": "Shopping cart", "t3c": "Checkout page", "t3d": "Orders panel",
      "t4a": "You test the site", "t4b": "Your feedback", "t5a": "Connect the domain", "t5b": "Publish & advertise",
      "tk.d": "Done", "tk.n": "In progress", "tk.t": "To do", "det.t": "What's inside “{s}”",
      "ap.t": "Needs your OK", "ap.s": "Just two small things, then we keep going.",
      "ap.a1": "Product page design", "ap.a1d": "Take a look and tell us what you think. If it's good, we build on it.",
      "ap.a2": "“About us” page text", "ap.a2d": "Read it over, and approve it if you like it.",
      "ap.yes": "Looks good, approve", "ap.edit": "I'd like a change", "ap.okr": "Approved. Thank you! The team has moved on.", "ap.chr": "Your note went to the team. They'll come back with the change.",
      "ap.e": "Nothing needed from you right now", "ap.es": "Everything has been reviewed. We'll tell you the moment we need you.",
      "pay.t": "Payments", "pay.s": "Your money follows the work, step by step.", "pay.of": "of", "pay.p": "paid",
      "pay.i1": "At the start", "pay.i2": "After design approval", "pay.i3": "Mid-build", "pay.i4": "Before launch",
      "pay.paid": "Paid", "pay.due": "In {n} days", "pay.btn": "Pay the next instalment", "pay.toast": "This is a demo account. Real payments switch on with your own account.", "cur": "EGP",
      "ads.t": "Your ads", "ads.s": "Last 14 days", "ads.spend": "Spent", "ads.orders": "Orders", "ads.roas": "Every pound returned", "ads.roasv": "{n} pounds",
      "fd.t": "Latest updates", "f1": "The team finished the shopping cart", "f1t": "2 hours ago", "f2": "We sent you the product page design to review", "f2t": "5 hours ago",
      "f3": "Your third payment arrived. Thank you", "f3t": "Yesterday", "f4": "Your ads returned 4.2 for every 1 spent", "f4t": "Yesterday", "f5": "We agreed on the launch date", "f5t": "3 days ago",
      "ch.t": "Talk to the team", "ch.s": "Ask anything and the team will answer.", "m1": "Hi {n}! If you have any question, write it here and we'll reply.",
      "q1": "Is the date still the same?", "q2": "I want to change something", "q3": "I need to talk to someone", "ch.ph": "Type what's on your mind…", "ch.send": "Send", "ch.cp": "Not happy with something?", "ch.cpb": "Submit a complaint",
      "ch.reply": "We got your message! (This is a demo account, so it isn't delivered. With your real account it reaches your project manager straight away.)", "now": "just now", "name": "Karim", "stage": "Building pages"
    }
  };
  function tr(k, v) {
    var s = (PT[lng()] || PT.ar)[k]; if (s == null) s = PT.ar[k] || k;
    if (v) for (var x in v) s = s.split("{" + x + "}").join(v[x]);
    return s;
  }
  function money(n) { return Math.round(n).toLocaleString("en-US") + " " + tr("cur"); }
  function dateOff(d) { return new Date(Date.now() + d * 864e5).toLocaleDateString(lng() === "en" ? "en-GB" : "ar-EG-u-nu-latn", { day: "numeric", month: "short" }); }

  /* ===================================================== portal state */
  var STAGES = [
    { off: -45, st: "d", tasks: [["t1a", "d"], ["t1b", "d"], ["t1c", "d"]] },
    { off: -20, st: "d", tasks: [["t2a", "d"], ["t2b", "d"], ["t2c", "d"]] },
    { off: -9, st: "c", tasks: [["t3a", "d"], ["t3b", "d"], ["t3c", "n"], ["t3d", "t"]] },
    { off: 10, st: "n", tasks: [["t4a", "t"], ["t4b", "t"]] },
    { off: 21, st: "n", tasks: [["t5a", "t"], ["t5b", "t"]] }
  ];
  var FR = [0, .21, .5, .78, 1];
  var INST = [[40000, "paid"], [35000, "paid"], [52300, "paid"], [25000, "due"]];
  var P = { el: null, open: false, view: "login", logged: false, pct: 72, ap: { a1: null, a2: null }, sel: 2, msgs: [], intro: false, L: 0, anim: 0 };
  var C = 2 * Math.PI * 84;

  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function fmtInt(v) { return Math.round(v).toLocaleString("en-US"); }
  function countUp(el, to, dur, fmt) {
    if (!el) return; fmt = fmt || fmtInt;
    if (reduced || !dur) { el.textContent = fmt(to); return; }
    var t0 = performance.now();
    (function f(now) { var k = Math.min(1, (now - t0) / dur); el.textContent = fmt(to * ease(k)); if (k < 1 && P.open) requestAnimationFrame(f); })(t0);
  }
  function toast(msg) {
    var old = q(".pa-toast"); if (old) old.remove();
    var t = doc.createElement("div"); t.className = "pa-toast"; t.setAttribute("role", "status"); t.textContent = msg; doc.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 3200);
  }
  function confetti(x, y, n, spread, palette) {
    if (reduced) return;
    var c = doc.createElement("canvas"); c.className = "pa-confetti"; var w = c.width = innerWidth, h = c.height = innerHeight; doc.body.appendChild(c);
    var g = c.getContext("2d"), cols = palette || ["#22c8ff", "#a470ff", "#ff5fa2", "#ffc857", "#2fe3a1", "#ffffff"], ps = [], i;
    for (i = 0; i < n; i++) ps.push({ x: x, y: y, vx: (Math.random() - .5) * spread, vy: -Math.random() * 10 - 3, s: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[i % cols.length], l: 0 });
    var t0 = performance.now();
    (function f(now) {
      g.clearRect(0, 0, w, h); var alive = 0;
      ps.forEach(function (p) {
        p.vy += .28; p.x += p.vx; p.y += p.vy; p.vx *= .992; p.r += p.vr; p.l++;
        if (p.y < h + 20) { alive++; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; g.globalAlpha = Math.max(0, 1 - p.l / 130); g.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); g.restore(); }
      });
      if (alive && now - t0 < 2800) requestAnimationFrame(f); else c.remove();
    })(t0);
  }

  /* ===================================================== building blocks */
  function ringSvg(p) {
    var ticks = "", i;
    for (i = 0; i < 60; i++) { var a = i / 60 * Math.PI * 2; ticks += '<line x1="' + (100 + Math.cos(a) * 96).toFixed(1) + '" y1="' + (100 + Math.sin(a) * 96).toFixed(1) + '" x2="' + (100 + Math.cos(a) * (i % 5 ? 98.5 : 100)).toFixed(1) + '" y2="' + (100 + Math.sin(a) * (i % 5 ? 98.5 : 100)).toFixed(1) + '"/>'; }
    return '<svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22c8ff"/><stop offset=".55" stop-color="#a470ff"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs>' +
      '<g class="tk">' + ticks + '</g><circle class="tr" cx="100" cy="100" r="84" fill="none" stroke-width="14"/>' +
      '<circle class="pg" id="rgPg" cx="100" cy="100" r="84" fill="none" stroke-width="14" style="stroke-dasharray:' + C + ';stroke-dashoffset:' + (P.intro ? C : C * (1 - p / 100)) + '"/>' +
      '<g class="orbit"><circle cx="100" cy="6" r="3.6"/></g></svg>';
  }
  function thumb(kind) {
    if (kind === "a1") return '<svg viewBox="0 0 100 100"><defs><linearGradient id="t1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5fa2"/><stop offset="1" stop-color="#a470ff"/></linearGradient></defs><rect x="28" y="8" width="44" height="84" rx="9" fill="#1b1d28" stroke="#ffffff33"/><rect x="33" y="15" width="34" height="30" rx="5" fill="url(#t1)"/><rect x="33" y="50" width="22" height="4" rx="2" fill="#fff" opacity=".85"/><rect x="33" y="58" width="30" height="3" rx="1.5" fill="#fff" opacity=".35"/><rect x="33" y="64" width="26" height="3" rx="1.5" fill="#fff" opacity=".35"/><rect x="33" y="74" width="34" height="9" rx="4.5" fill="#2fe3a1"/></svg>';
    return '<svg viewBox="0 0 100 100"><rect x="20" y="10" width="60" height="80" rx="7" fill="#f5f4f1"/><rect x="28" y="20" width="26" height="5" rx="2.5" fill="#a470ff"/><rect x="28" y="32" width="44" height="3" rx="1.5" fill="#3a3e55" opacity=".5"/><rect x="28" y="40" width="40" height="3" rx="1.5" fill="#3a3e55" opacity=".4"/><rect x="28" y="48" width="44" height="3" rx="1.5" fill="#3a3e55" opacity=".4"/><rect x="28" y="56" width="30" height="3" rx="1.5" fill="#3a3e55" opacity=".4"/><rect x="28" y="70" width="22" height="8" rx="4" fill="#22c8ff"/></svg>';
  }
  function chartSvg() {
    var data = [38, 44, 41, 55, 52, 63, 60, 74, 70, 82, 79, 91, 96, 108], W = 520, H = 150, mx = 120, pts = data.map(function (v, i) { return [i / (data.length - 1) * W, H - 14 - v / mx * (H - 30)]; }), d = "M" + pts[0][0] + " " + pts[0][1], i;
    for (i = 1; i < pts.length; i++) { var p0 = pts[i - 1], p1 = pts[i], cx = (p0[0] + p1[0]) / 2; d += " C" + cx + " " + p0[1] + "," + cx + " " + p1[1] + "," + p1[0] + " " + p1[1]; }
    var last = pts[pts.length - 1];
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22c8ff"/><stop offset="1" stop-color="#a470ff"/></linearGradient><linearGradient id="ca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a470ff" stop-opacity=".4"/><stop offset="1" stop-color="#a470ff" stop-opacity="0"/></linearGradient></defs>' +
      '<line class="gl" x1="0" y1="40" x2="' + W + '" y2="40"/><line class="gl" x1="0" y1="85" x2="' + W + '" y2="85"/><line class="gl" x1="0" y1="130" x2="' + W + '" y2="130"/>' +
      '<path class="ar" d="' + d + ' L' + W + ' ' + H + ' L0 ' + H + ' Z"/><path class="ln" id="chLn" d="' + d + '"/><circle class="pt" cx="' + last[0] + '" cy="' + last[1] + '" r="5"/></svg>';
  }
  function pending() { return (P.ap.a1 ? 0 : 1) + (P.ap.a2 ? 0 : 1); }
  function sumHtml() {
    var n = pending(), stage = tr("s3.n");
    if (!n) return tr("sum.none", { stage: stage });
    var w = lng() === "en" ? (n === 1 ? "1 thing needs" : n + " things need") : (n === 1 ? "حاجة واحدة محتاجة" : "حاجتين محتاجين");
    return tr("sum.some", { stage: stage, w: w });
  }
  function approvalHtml(id) {
    var st = P.ap[id], cls = st === "ok" ? " ok" : st === "ch" ? " ch" : "";
    return '<div class="ap' + cls + '" data-ap="' + id + '"><div class="th">' + thumb(id) + '</div><div><h4>' + tr("ap." + id) + '</h4><p>' + tr("ap." + id + "d") + '</p>' +
      (st ? '<div class="res"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>' + tr(st === "ok" ? "ap.okr" : "ap.chr") + '</div>'
        : '<div class="btns"><button type="button" class="b yes" data-act="yes">' + tr("ap.yes") + '</button><button type="button" class="b" data-act="edit">' + tr("ap.edit") + '</button></div>') + '</div></div>';
  }
  function approvalsHtml() {
    var h = approvalHtml("a1") + approvalHtml("a2");
    if (!pending()) h += '<div class="empty"><b>' + tr("ap.e") + '</b><span>' + tr("ap.es") + '</span></div>';
    return h;
  }
  function stageStateLabel(s) { return tr("st." + s); }
  function stagesHtml() {
    return STAGES.map(function (s, i) {
      return '<button type="button" class="stg' + (i === P.sel ? " sel" : "") + '" data-stage="' + i + '"><span class="pa-pill ' + (s.st === "d" ? "ok" : s.st === "c" ? "warm" : "peri") + '">' + (s.st === "c" ? '<i class="dotp"></i>' : "") + stageStateLabel(s.st) + '</span><b>' + tr("s" + (i + 1) + ".n") + '</b><p>' + tr("s" + (i + 1) + ".d") + '</p><span class="when">' + dateOff(s.off) + '</span></button>';
    }).join("");
  }
  function detailHtml() {
    var s = STAGES[P.sel];
    return '<h4>' + tr("det.t", { s: tr("s" + (P.sel + 1) + ".n") }) + '</h4><ul class="tasks">' + s.tasks.map(function (t) {
      return '<li><i class="tk ' + t[1] + '">' + (t[1] === "d" ? "✓" : t[1] === "n" ? "•" : "") + '</i>' + tr(t[0]) + '<small>' + tr("tk." + t[1]) + '</small></li>';
    }).join("") + '</ul>';
  }
  function chatHtml() {
    return P.msgs.map(function (m) {
      return '<div class="bub ' + m.who + '">' + (m.k ? tr(m.k, { n: tr("name") }) : m.txt.replace(/</g, "&lt;")) + '<small>' + tr("now") + '</small></div>';
    }).join("");
  }

  function viewLogin() {
    return '<div class="pl">' +
      '<div class="pl-float f1"><span class="ico" style="background:#2fe3a122;color:#2fe3a1">✓</span><span><b>' + tr("fl1") + '</b><small>' + tr("fl1s") + '</small></span></div>' +
      '<div class="pl-float f2"><span class="ico" style="background:#a470ff22;color:#a470ff">%</span><span><b>' + tr("fl2") + '</b><small>' + tr("fl2s") + '</small></span></div>' +
      '<div class="pl-float f3"><span class="ico" style="background:#ffc85722;color:#ffc857">$</span><span><b>' + tr("fl3") + '</b><small>' + tr("fl3s") + '</small></span></div>' +
      '<div class="pl-float f4"><span class="ico" style="background:#22c8ff22;color:#22c8ff">↗</span><span><b>' + tr("fl4") + '</b><small>' + tr("fl4s") + '</small></span></div>' +
      '<div class="pl-card pa-card glow-border pr"><div class="pl-orb" aria-hidden="true"><i class="o1"></i><i class="o2"></i><i class="o3"></i></div>' +
      '<h1 class="pl-title title-gradient rainbow">' + tr("login.title") + '</h1><p class="pl-sub">' + tr("login.sub") + '</p>' +
      '<form class="pl-form" id="plForm" novalidate><div><label for="plCode">' + tr("login.code") + '</label><input id="plCode" autocomplete="off" autocapitalize="characters" placeholder="TU-2481" inputmode="text"></div>' +
      '<div><label for="plPin">' + tr("login.pin") + '</label><input id="plPin" type="password" autocomplete="off" placeholder="••••" inputmode="numeric"></div>' +
      '<p class="pl-err" id="plErr" role="alert"></p><button class="pa-btn" type="submit">' + tr("login.go") + '</button><button class="pa-btn ghost" type="button" id="plDemo">' + tr("login.demo") + '</button></form>' +
      '<p class="pl-foot">' + tr("login.noacc") + ' <button type="button" data-open-request="portal-login">' + tr("login.req") + '</button><br><button type="button" data-open-track>' + tr("login.track") + '</button></p></div></div>';
  }
  function viewSplash() {
    return '<div class="ps"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="psg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22c8ff"/><stop offset=".6" stop-color="#a470ff"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs><circle class="tr" cx="60" cy="60" r="50" fill="none" stroke-width="8"/><circle class="pg" cx="60" cy="60" r="50" fill="none" stroke-width="8"/></svg>' +
      '<h2 class="title-gradient rainbow">' + tr("splash.hi", { n: tr("name") }) + '</h2><p>' + tr("splash.p") + '</p></div>';
  }
  function viewDash() {
    var h = new Date().getHours(), hk = h < 12 ? "hello.m" : h < 17 ? "hello.d" : "hello.e", n = pending();
    var paid = 127300, total = 152300;
    return '<div class="pd">' +
      '<div class="pd-hello pr"><div><h1 class="title-gradient rainbow">' + tr(hk, { n: tr("name") }) + '</h1><p class="pd-sum" id="pdSum">' + sumHtml() + '</p></div></div>' +
      '<div class="pd-demo pr"><span>' + tr("demo.note") + '</span><a data-open-request="portal-demo">' + tr("demo.cta") + ' →</a></div>' +
      '<section class="pa-card tilt glow-border pd-hero pr" style="margin-top:1rem"><div class="ring">' + ringSvg(P.pct) + '<div class="mid"><b id="rgNum">' + (P.intro ? 0 : P.pct) + '%</b><small>' + tr("hero.done") + '</small></div></div>' +
      '<div class="pd-info"><div class="pd-meta"><span class="pa-pill ok"><i class="dotp"></i>' + tr("hero.ok") + '</span></div><h2>' + tr("hero.proj") + '</h2>' +
      '<div class="pd-facts"><div class="fact"><small>' + tr("hero.now") + '</small><b>' + tr("s3.n") + '</b></div><div class="fact"><small>' + tr("hero.eta") + '</small><b>' + dateOff(21) + '</b></div><div class="fact"><small>' + tr("hero.left") + '</small><b class="num">' + tr("hero.days", { n: 21 }) + '</b></div>' +
      '<div class="fact"><small>' + tr("hero.team") + '</small><div class="team"><i style="background:#22c8ff">' + (lng() === "en" ? "S" : "س") + '</i><i style="background:#ff5fa2">' + (lng() === "en" ? "M" : "م") + '</i><i style="background:#ffc857">' + (lng() === "en" ? "A" : "أ") + '</i></div></div></div></div></section>' +
      '<section class="pa-card jr pr" style="margin-top:1rem"><h3>' + tr("j.title") + '</h3><p class="sub">' + tr("j.sub") + '</p>' +
      '<svg viewBox="0 0 900 210" aria-hidden="true"><defs><linearGradient id="jg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22c8ff"/><stop offset=".5" stop-color="#a470ff"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs>' +
      '<path id="jrRoad" class="road" d="M40 150 C160 150 170 50 300 62 S440 168 560 128 S720 36 860 64"/><path class="dash" d="M40 150 C160 150 170 50 300 62 S440 168 560 128 S720 36 860 64"/><path id="jrDone" class="done" d="M40 150 C160 150 170 50 300 62 S440 168 560 128 S720 36 860 64"/><g id="jrSt"></g>' +
      '<g class="rocket" id="jrRocket"><g class="bob"><path class="flame" d="M-15 -3.5 L-34 0 L-15 3.5Z" fill="#ffc857"/><path d="M-15 -8 L-24 -15 L-15 -2Z" fill="#ff5fa2"/><path d="M-15 8 L-24 15 L-15 2Z" fill="#ff5fa2"/><path d="M-15 -8 L8 -8 Q22 0 8 8 L-15 8Z" fill="#f4f5fa"/><path d="M6 -8 Q22 0 6 8Z" fill="url(#jg)"/><circle cx="-3" cy="0" r="3.4" fill="#22c8ff" stroke="#0b0c12" stroke-width="1.2"/></g></g></svg>' +
      '<div class="stages" id="stages">' + stagesHtml() + '</div><div class="stg-detail" id="stgDetail">' + detailHtml() + '</div></section>' +
      '<div class="pa-grid2"><section class="pa-card tilt c7 pr"><h3>' + tr("ap.t") + (n ? ' <span class="pa-pill pink" id="apCount">' + n + '</span>' : ' <span class="pa-pill pink" id="apCount" hidden></span>') + '</h3><p class="sub">' + tr("ap.s") + '</p><div class="apr" id="apr">' + approvalsHtml() + '</div></section>' +
      '<section class="pa-card tilt c5 pr"><h3>' + tr("pay.t") + '</h3><p class="sub">' + tr("pay.s") + '</p><div class="pay-bar"><i id="payFill" style="width:' + (P.intro ? 0 : paid / total * 100) + '%"></i></div>' +
      '<div class="pay-tot"><span><b class="num" id="payNum">' + (P.intro ? 0 : fmtInt(paid)) + '</b> ' + tr("pay.of") + ' <span class="num">' + fmtInt(total) + '</span> ' + tr("cur") + ' ' + tr("pay.p") + '</span></div>' +
      '<div class="inst">' + INST.map(function (it, i) { return '<div><span class="pa-pill ' + (it[1] === "paid" ? "ok" : "warm") + '">' + (it[1] === "paid" ? tr("pay.paid") : tr("pay.due", { n: 6 })) + '</span><span>' + tr("pay.i" + (i + 1)) + '</span><span class="num">' + fmtInt(it[0]) + '</span></div>'; }).join("") + '</div>' +
      '<p style="margin:.9rem 0 0"><button type="button" class="pa-btn" id="payBtn">' + tr("pay.btn") + '</button></p></section>' +
      '<section class="pa-card tilt c7 pr"><h3>' + tr("ads.t") + '</h3><p class="sub">' + tr("ads.s") + '</p><div class="kp"><div><small>' + tr("ads.spend") + '</small><b class="num" data-cu="18400">' + (P.intro ? 0 : "18,400") + '</b></div><div><small>' + tr("ads.orders") + '</small><b class="num" data-cu="1284">' + (P.intro ? 0 : "1,284") + '</b></div><div><small>' + tr("ads.roas") + '</small><b class="num">' + tr("ads.roasv", { n: "4.2" }) + '</b></div></div>' + chartSvg() + '</section>' +
      '<section class="pa-card tilt c5 pr"><h3>' + tr("fd.t") + '</h3><ul class="feed" style="margin-top:.7rem">' +
      [["f1", "#2fe3a1", "✓"], ["f2", "#ff5fa2", "!"], ["f3", "#ffc857", "$"], ["f4", "#22c8ff", "↗"], ["f5", "#a470ff", "★"]].map(function (f) { return '<li><i class="ic" style="background:' + f[1] + '">' + f[2] + '</i><span>' + tr(f[0]) + '<small>' + tr(f[0] + "t") + '</small></span></li>'; }).join("") + '</ul></section>' +
      '<section class="pa-card c12 pr"><h3>' + tr("ch.t") + '</h3><p class="sub">' + tr("ch.s") + '</p><div class="chat" id="chat">' + chatHtml() + '</div><div class="qk"><button type="button" data-q="q1">' + tr("q1") + '</button><button type="button" data-q="q2">' + tr("q2") + '</button><button type="button" data-q="q3">' + tr("q3") + '</button></div>' +
      '<p class="ch-cp">' + tr("ch.cp") + ' <button type="button" data-open-complaint>' + tr("ch.cpb") + '</button></p><form class="send" id="chatForm"><input id="chatIn" autocomplete="off" placeholder="' + tr("ch.ph") + '" aria-label="' + tr("ch.ph") + '"><button class="pa-btn" type="submit">' + tr("ch.send") + '</button></form></section></div></div>';
  }

  /* ===================================================== motion */
  function layoutJourney() {
    var road = q("#jrRoad", P.el); if (!road) return;
    P.L = road.getTotalLength();
    var g = q("#jrSt", P.el), h = "";
    FR.forEach(function (f, i) {
      var pt = road.getPointAtLength(P.L * f), s = STAGES[i].st;
      h += '<g class="st ' + s + '" transform="translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')">' + (s === "c" ? '<circle class="p" r="15"/>' : "") + '<circle class="o" r="15"/><text>' + (i + 1) + '</text></g>';
    });
    g.innerHTML = h;
  }
  function place(p) {
    var road = q("#jrRoad", P.el); if (!road) return;
    var f = p / 100, a = road.getPointAtLength(P.L * f), b = road.getPointAtLength(Math.min(P.L, P.L * f + 2)), c = road.getPointAtLength(Math.max(0, P.L * f - 2));
    q("#jrRocket", P.el).setAttribute("transform", "translate(" + a.x.toFixed(1) + " " + a.y.toFixed(1) + ") rotate(" + (Math.atan2(b.y - c.y, b.x - c.x) * 180 / Math.PI).toFixed(1) + ")");
    q("#jrDone", P.el).style.strokeDasharray = (P.L * f) + " " + P.L;
  }
  function animateProgress(from, to, dur) {
    cancelAnimationFrame(P.anim);
    var pg = q("#rgPg", P.el), num = q("#rgNum", P.el);
    if (pg) pg.style.strokeDashoffset = C * (1 - to / 100);
    if (reduced || !dur) { place(to); if (num) num.textContent = Math.round(to) + "%"; return; }
    var t0 = performance.now();
    (function f(now) {
      if (!P.open) return;
      var k = Math.min(1, (now - t0) / dur), v = from + (to - from) * ease(k);
      place(v); if (num) num.textContent = Math.round(v) + "%";
      if (k < 1) P.anim = requestAnimationFrame(f);
    })(t0);
  }
  function drawChart() {
    var ln = q("#chLn", P.el); if (!ln || reduced || !P.intro) return;
    var L = ln.getTotalLength(); ln.style.strokeDasharray = L; ln.style.strokeDashoffset = L;
    ln.getBoundingClientRect(); ln.style.transition = "stroke-dashoffset 2s ease .3s"; ln.style.strokeDashoffset = 0;
  }
  function bindTilt() {
    if (reduced || (window.matchMedia && matchMedia("(hover:none)").matches)) return;
    qa(".tilt", P.el).forEach(function (c) {
      c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.setProperty("--ry", (x * 5).toFixed(2) + "deg"); c.style.setProperty("--rx", (-y * 5).toFixed(2) + "deg"); });
      c.addEventListener("pointerleave", function () { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
  }
  function reveal(main) {
    var els = qa(".pr", main), scroller = q("#paScroll", P.el);
    if (!P.intro || reduced || !("IntersectionObserver" in window)) { main.classList.add("no-anim"); return; }
    main.classList.remove("no-anim");
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }); }, { root: scroller, threshold: .06 });
    els.forEach(function (e, i) { e.style.setProperty("--d", (i % 3) * .09 + "s"); io.observe(e); });
  }

  /* ===================================================== render */
  function paintTop() {
    if (!P.el) return;
    P.el.setAttribute("dir", lng() === "en" ? "ltr" : "rtl"); P.el.setAttribute("lang", lng() === "en" ? "en" : "ar");
    q("#paLang").textContent = tr("top.lang"); q("#paReq").innerHTML = '<span class="rq-long">' + tr("top.req") + '</span><span class="rq-short">' + tr("top.reqs") + '</span>';
    var x = q("#paClose"); x.setAttribute("aria-label", tr("top.close")); x.title = tr("top.close");
    var lo = q("#paOut"); lo.textContent = tr("top.logout"); lo.hidden = !P.logged;
  }
  function render() {
    var main = q("#paMain", P.el);
    cancelAnimationFrame(P.anim);
    main.innerHTML = P.view === "login" ? viewLogin() : P.view === "splash" ? viewSplash() : viewDash();
    paintTop();
    reveal(main);
    if (P.view === "dash") {
      layoutJourney();
      if (P.intro && !reduced) { place(0); animateProgress(0, P.pct, 2400); var pg = q("#rgPg", P.el); pg.style.strokeDashoffset = C; requestAnimationFrame(function () { requestAnimationFrame(function () { pg.style.strokeDashoffset = C * (1 - P.pct / 100); }); }); }
      else animateProgress(P.pct, P.pct, 0);
      var fill = q("#payFill", P.el), pn = q("#payNum", P.el);
      if (P.intro && !reduced) { setTimeout(function () { if (fill) fill.style.width = (127300 / 152300 * 100) + "%"; countUp(pn, 127300, 1600); }, 500); qa("[data-cu]", P.el).forEach(function (e) { countUp(e, +e.getAttribute("data-cu"), 1800); }); }
      drawChart(); bindTilt();
      var chat = q("#chat", P.el); if (chat) chat.scrollTop = chat.scrollHeight;
      P.intro = false;
    } else if (P.view === "login") { bindLogin(); }
  }

  /* ===================================================== interactions */
  function bindLogin() {
    var f = q("#plForm", P.el), err = q("#plErr", P.el);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var c = q("#plCode").value.trim().toUpperCase(), p = q("#plPin").value.trim();
      if (!c || !p) { err.textContent = tr("login.errEmpty"); return; }
      if (/^(TU-[BSG]|CP-[BSGN])-\d{5}$/.test(c)) { err.textContent = tr("login.isreq"); openTrack(c); return; }
      if (c !== "TU-2481") { err.textContent = tr("login.errBad"); return; }
      success();
    });
    q("#plDemo", P.el).addEventListener("click", quickLogin);
    setTimeout(function () { var c = q("#plCode"); if (c && P.open && P.view === "login") c.focus(); }, 120);
  }
  function typeInto(el, text, step, done) {
    var i = 0; (function t() { el.value = text.slice(0, ++i); if (i < text.length) setTimeout(t, step); else done(); })();
  }
  function quickLogin() {
    var c = q("#plCode"), p = q("#plPin"); if (!c) return success();
    if (reduced) { c.value = "TU-2481"; p.value = "1234"; return success(); }
    typeInto(c, "TU-2481", 55, function () { typeInto(p, "1234", 70, function () { setTimeout(success, 220); }); });
  }
  function success() {
    P.logged = true; P.view = "splash"; P.intro = true; render();
    var r = q(".ps svg", P.el).getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, 110, 14);
    setTimeout(function () { if (P.open && P.view === "splash") { P.view = "dash"; render(); } }, reduced ? 200 : 1900);
  }
  function openPortal(demo) {
    ensure(); if (P.open) return;
    P.open = true; P.el.classList.add("open"); lock(true);
    P.view = P.logged ? "dash" : "login"; P.intro = P.logged; render();
    if (demo && !P.logged) setTimeout(quickLogin, 450);
    else setTimeout(function () { var x = q("#paClose"); if (x && P.view === "dash") x.focus(); }, 80);
  }
  function closePortal() {
    if (!P.open) return;
    P.open = false; cancelAnimationFrame(P.anim); P.el.classList.remove("open"); lock(false);
    q("#paMain", P.el).innerHTML = ""; var c = q(".pa-confetti"); if (c) c.remove();
    if (P.last && P.last.focus) { try { P.last.focus(); } catch (e) {} }
  }
  function ensure() {
    if (P.el) return;
    var el = doc.createElement("div");
    el.className = "pa"; el.id = "portalApp"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "TaskUp");
    el.innerHTML = '<div class="pa-bg" aria-hidden="true"><i class="pa-blob b1"></i><i class="pa-blob b2"></i><i class="pa-blob b3"></i><i class="pa-grid"></i></div>' +
      '<div class="pa-top"><span class="wordmark"><b>task</b><span>up</span></span><button type="button" class="pa-chip" id="paLang"></button><button type="button" class="pa-chip" id="paOut" hidden></button><button type="button" class="pa-chip hot" id="paReq" data-open-request="portal-top"></button><button type="button" class="pa-chip x" id="paClose">×</button></div>' +
      '<div class="pa-scroll" id="paScroll"><div class="pa-main" id="paMain"></div></div>';
    doc.body.appendChild(el); P.el = el;
    q("#paClose", el).addEventListener("click", closePortal);
    q("#paLang", el).addEventListener("click", function () { var b = q(".lang-btn"); if (b) b.click(); });
    q("#paOut", el).addEventListener("click", function () { P.logged = false; P.view = "login"; P.intro = false; P.ap = { a1: null, a2: null }; P.pct = 72; P.msgs = []; seedMsgs(); render(); });
    el.addEventListener("click", function (e) {
      var s = e.target.closest("[data-stage]");
      if (s) { P.sel = +s.getAttribute("data-stage"); qa(".stg", el).forEach(function (b, i) { b.classList.toggle("sel", i === P.sel); }); var d = q("#stgDetail", el); d.innerHTML = detailHtml(); d.style.animation = "none"; d.getBoundingClientRect(); d.style.animation = ""; return; }
      var a = e.target.closest("[data-act]");
      if (a) { approve(a.closest("[data-ap]").getAttribute("data-ap"), a.getAttribute("data-act"), a); return; }
      if (e.target.closest("#payBtn")) { toast(tr("pay.toast")); return; }
      var qk = e.target.closest("[data-q]");
      if (qk) { sendMsg(qk.textContent); return; }
    });
    el.addEventListener("submit", function (e) {
      if (e.target.id === "chatForm") { e.preventDefault(); var i = q("#chatIn", el); if (i.value.trim()) { sendMsg(i.value.trim()); i.value = ""; } }
    });
    seedMsgs();
  }
  function seedMsgs() { P.msgs = [{ who: "t", k: "m1" }]; }
  function approve(id, act, btn) {
    if (P.ap[id]) return;
    P.ap[id] = act === "yes" ? "ok" : "ch";
    var card = q('[data-ap="' + id + '"]', P.el), r = btn.getBoundingClientRect();
    if (act === "yes") { var from = P.pct; P.pct = Math.min(100, P.pct + 2); animateProgress(from, P.pct, 1100); confetti(r.left + r.width / 2, r.top, 60, 10); }
    card.outerHTML = approvalHtml(id);
    var n = pending(), cnt = q("#apCount", P.el); if (cnt) { cnt.textContent = n; cnt.hidden = !n; }
    q("#pdSum", P.el).innerHTML = sumHtml();
    if (!n) { var box = q("#apr", P.el); box.insertAdjacentHTML("beforeend", '<div class="empty"><b>' + tr("ap.e") + '</b><span>' + tr("ap.es") + '</span></div>'); }
  }
  function sendMsg(text) {
    var chat = q("#chat", P.el); if (!chat) return;
    P.msgs.push({ who: "m", txt: text });
    chat.insertAdjacentHTML("beforeend", '<div class="bub m">' + text.replace(/</g, "&lt;") + '<small>' + tr("now") + '</small></div>');
    chat.insertAdjacentHTML("beforeend", '<div class="typing" id="typing"><i></i><i></i><i></i></div>'); chat.scrollTop = chat.scrollHeight;
    setTimeout(function () {
      var t = q("#typing", P.el); if (t) t.remove();
      if (!P.open) return;
      P.msgs.push({ who: "t", k: "ch.reply" });
      chat.insertAdjacentHTML("beforeend", '<div class="bub t">' + tr("ch.reply") + '<small>' + tr("now") + '</small></div>'); chat.scrollTop = chat.scrollHeight;
    }, reduced ? 200 : 1500);
  }

  /* ===================================================== wiring */
  doc.addEventListener("click", function (e) {
    var cc = e.target.closest("[data-open-complaint]");
    if (cc) { e.preventDefault(); openComplaint(cc.getAttribute("data-open-complaint") || ""); return; }
    var t = e.target.closest("[data-open-track]");
    if (t) { e.preventDefault(); openTrack(t.getAttribute("data-open-track") || ""); return; }
    var r = e.target.closest("[data-open-request]");
    if (r) { e.preventDefault(); openRequest(r.getAttribute("data-open-request")); return; }
    var p = e.target.closest("[data-open-portal]");
    if (p) { e.preventDefault(); P.last = doc.activeElement; openPortal(p.getAttribute("data-open-portal") === "demo"); }
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (trm && !trm.hidden) closeTrack(); else if (cpm && !cpm.hidden) closeComplaint(); else if (rq && !rq.hidden) closeRequest(); else if (P.open) closePortal();
  });
  doc.addEventListener("taskup:lang", function () {
    if (rq && !rq.hidden) rqRender();
    if (cpm && !cpm.hidden) cpRender();
    if (trm && !trm.hidden) trRender();
    if (P.el) { paintTop(); if (P.open && P.view !== "splash") { P.intro = false; render(); } }
  });
  window.taskupPortal = { open: openPortal, close: closePortal };
  window.taskupRequest = { open: openRequest, close: closeRequest };
  window.taskupTrack = { open: openTrack, close: closeTrack };
  window.taskupComplaint = { open: openComplaint, close: closeComplaint };
})();
