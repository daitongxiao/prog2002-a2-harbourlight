# Harbourlight A2 demonstration script / Harbourlight A2 演示讲稿

**Target running time:** approximately 12 minutes 20 seconds, including pauses for screen actions; keep the final recording under 15 minutes. **Spoken language:** English. The Chinese paragraphs are a translation for rehearsal and must not be read after the English paragraphs. This is a recording plan, not a claim that a video has been recorded.

**Before recording / 录制前准备:** Start the MySQL database with the seeded `charityevents_db`, the API on port 4101, and the client on port 3000. Open the project in an editor, a browser at `http://localhost:3000`, a MySQL query window, and browser developer tools. Keep `.env`, passwords, terminal history containing credentials, and unrelated desktop content off screen. Check that the seeded 2026–2027 events are still upcoming on the recording date; if they have expired, update fictional dates consistently before recording and adjust the example date below. Do one timed rehearsal. The timings are budgets, so move on when the result is visible.

## 0:00–0:45 — What was built / 项目概览

**Screen actions / 屏幕操作:** Show the home page at `http://localhost:3000`; briefly point to the navigation and upcoming event cards. Keep the cursor still while speaking.

**Say in English / 英文口述:** “This is Harbourlight Community Events, a fictional charity event website. Visitors can browse upcoming events, search by date, location and category, and open full event details. The application has a MySQL database, a read-only Express API, and a responsive browser client written in plain HTML, CSS and JavaScript. I will show the data model, the request flow, and the working user journey.”

**中文对照（不朗读）:** “这是虚构的慈善活动网站 Harbourlight Community Events。访客可以浏览即将举行的活动，按日期、地点和类别搜索，并查看详情。系统由 MySQL 数据库、只读 Express API 和原生 HTML、CSS、JavaScript 响应式前端组成。接下来展示数据模型、请求流程和实际操作。”

## 0:45–2:05 — Database entities and seed / 数据库实体和样例数据

**Screen actions / 屏幕操作:** In the editor show `api/schema.sql`. Point to `organisations`, `categories`, and `events`, the two foreign keys, UTC time columns, `start_local_date`, and `is_suspended`. Then show `api/seed.sql` briefly. In a MySQL query window run only read queries such as `SELECT COUNT(*) AS total, SUM(is_suspended) AS suspended FROM events;` and `SELECT id, name FROM categories ORDER BY name;`. Show the results: 11 records, one suspended, five categories. Do not display connection settings or credentials.

**Say in English / 英文口述:** “The database has three related entities. Organisations identify who runs an event. Categories support searching. Each event references one organisation and one category. Events also store their venue, city, purpose, description, ticket price, fundraising goal and amount raised. The seed contains ten public fictional events across five categories, plus one suspended record to check visibility. The foreign keys protect these relationships, and checks require a valid time order and non-negative money values. Timestamps are stored in UTC, while `start_local_date` records the Sydney calendar date used by the date filter. This matters when a Sydney morning falls on the previous UTC date.”

**中文对照（不朗读）:** “数据库有三个关联实体：机构表示活动组织方，类别用于搜索，活动分别引用一个机构和一个类别。活动还保存地点、城市、目的、描述、票价、筹款目标和已筹金额。样例含五个类别、十个公开虚构活动和一条暂停活动。外键维护关联，约束要求结束晚于开始且金额非负。时间戳存为 UTC，`start_local_date` 保存悉尼本地开始日期，因此悉尼早上的活动即使在 UTC 仍是前一天，也能按正确日期筛选。”

## 2:05–3:25 — Data access and visibility / 数据访问与可见性

**Screen actions / 屏幕操作:** Show `api/event_db.js`, focusing on `listEvents`, `getEvent`, `mysqlUtcToSydneyIso`, and the bound `pool.execute` parameters. Point to the `is_suspended` and `end_at_utc` conditions. Avoid showing `.env`.

**Say in English / 英文口述:** “The data access module uses `mysql2` prepared parameters rather than placing user input into SQL text. The public list and detail queries exclude suspended events and events whose end time has passed. Date, location and category conditions are combined with AND. Location matches either the venue or city without case sensitivity, and SQL wildcard characters entered by a visitor are escaped. The formatter converts UTC database values into ISO timestamps with the correct Australia/Sydney offset, including daylight saving. The normal API database account has SELECT permission only. A production deployment would still need operational controls such as monitoring and backups.”

**中文对照（不朗读）:** “数据访问模块使用 `mysql2` 参数绑定，不把用户输入直接拼进 SQL。公开列表和详情查询排除暂停以及已结束活动。日期、地点和类别以 AND 组合；地点不区分大小写地匹配场地或城市，并转义用户输入的 SQL 通配符。格式化函数把 UTC 转成带正确悉尼时区偏移的 ISO 时间，包括夏令时。API 日常数据库账号只有 SELECT 权限。真实部署还需要监控和备份等运维措施。”

## 3:25–4:45 — API and real filter requests / 接口与真实筛选请求

**Screen actions / 屏幕操作:** Show `api/app.js` and the three GET routes. In a browser tab request `http://localhost:4101/api/events`, then `http://localhost:4101/api/categories`, then `http://localhost:4101/api/events?date=2026-10-17&location=Sydney&category=1`. Point to the JSON `data` arrays and the single combined-filter event. If the sample dates have been changed, use the matching new Sydney date.

**Say in English / 英文口述:** “The Express API exposes three read-only endpoints: the event list, categories, and one event by ID. Each successful response contains a `data` field. Here the unfiltered list returns the visible upcoming events, and categories are fetched separately for the search menu. This third request combines Sydney start date, location and category. It returns one matching event, showing that the filter logic runs in the database rather than against a hard-coded list in the browser. Invalid input receives a 400 response, and an unavailable event receives 404.”

**中文对照（不朗读）:** “Express API 提供三个只读 GET 接口：活动列表、类别列表和按 ID 读取单个活动。成功响应都包含 `data` 字段。无筛选列表返回可见的即将举行活动，类别接口单独供搜索菜单使用。第三个请求组合了悉尼本地开始日期、地点和类别，只返回一个匹配活动，说明筛选在数据库查询中完成，前端没有写死活动列表。无效输入返回 400，不可用活动返回 404。”

## 4:45–6:00 — Browser request to DOM / 浏览器请求到页面元素

**Screen actions / 屏幕操作:** Return to the site. Open developer tools **Network** and reload the home page. Select the `/api/events` request and show its JSON response. Switch to `clientside/app.js`; point to `getData`, `home`, `createCard`, and `paintCards`. In developer tools **Elements**, select one card inside `#home-events`.

**Say in English / 英文口述:** “The browser calls `/api/events` using `fetch`. The client server forwards that request to the API, keeping the browser on one origin. `getData` checks the HTTP response and extracts `data`. On the home page, JavaScript sorts the returned events and builds card elements with DOM methods such as `createElement` and `textContent`. Here is a card inserted into the `home-events` container. Its title, date, category and location came from the JSON response. Loading, empty and retry states are also handled, so the page gives feedback if data cannot be loaded.”

**中文对照（不朗读）:** “浏览器用 `fetch` 请求 `/api/events`，前端服务器再把请求转发给 API，使浏览器保持同源。`getData` 检查 HTTP 响应并取出 `data`。首页 JavaScript 对返回活动排序，再通过 `createElement` 和 `textContent` 等 DOM 方法生成卡片。这里能看到卡片被插入 `home-events` 容器，标题、日期、类别和地点来自 JSON。页面也处理加载中、空结果和重试状态。”

## 6:00–8:15 — Search, combined filters and reset / 搜索、组合筛选与清空

**Screen actions / 屏幕操作:** Click **Find events**. Show that categories load. First enter `Sydney` as Location and click **Search events**; point to the count and results. Then set Date to **17 October 2026** and Category to **Community & Family**, leaving Location as `Sydney`, and submit. Show the one result and the URL query string. Click **Clear filters**; show all public upcoming results and that the URL filters disappear. If seed dates changed, adapt the date while keeping the same three-filter demonstration.

**Say in English / 英文口述:** “The search page loads category options from the API. I first search for Sydney to demonstrate a place search. Now I add a date and category, so all three conditions must match. The result count drops to one, and the URL reflects the selected filters. The date means the event’s local start date in Sydney. The form uses `URLSearchParams`, and each submission sends a new API request. Clear filters resets the controls, removes the query string and reloads the full visible list. If there were no matches, the page would explain that instead of showing an empty unexplained area.”

**中文对照（不朗读）:** “搜索页从 API 加载类别选项。我先搜索 Sydney 展示地点筛选，再加入日期和类别，使三个条件必须同时匹配。结果变为一条，URL 也反映所选筛选项。日期指活动在悉尼的本地开始日期。表单使用 `URLSearchParams`，每次提交都会重新请求 API。清空筛选会重置控件、移除 URL 参数并重新加载全部可见活动。没有匹配项时页面会给出解释。”

## 8:15–9:45 — Detail and Register / 详情与报名提示

**Screen actions / 屏幕操作:** From the search results open **Neighbourhood Lantern Walk** (event ID 1). Show the category, purpose, description, organiser, goal, amount raised, Sydney time, venue, city and ticket price. Open the Network request for `/api/events/1` if convenient. Click **Register interest**, show the modal message, then close it.

**Say in English / 英文口述:** “Opening a card takes the visitor to `event.html` with the event ID in the URL. The detail page requests that ID from the API and fills the page from the returned event object. The information includes the organisation, schedule, venue, ticket price and fundraising progress. The progress bar is calculated from amount raised divided by the goal. Register interest opens a dialog with the exact message, ‘This feature is currently under construction.’ There is no registration form or personal-data collection in this version, so I am not presenting registration as a completed feature.”

**中文对照（不朗读）:** “点击卡片会进入带活动 ID 的 `event.html`。详情页按该 ID 请求 API，并用返回的活动对象填充组织方、时间、场地、票价和筹款进度等内容。进度条由已筹金额除以目标金额计算。点击 Register interest 会打开对话框，显示准确提示 ‘This feature is currently under construction.’ 当前版本没有报名表或个人资料收集，因此不将报名描述为已完成。”

## 9:45–11:00 — Error paths and checks / 错误路径与验证

**Screen actions / 屏幕操作:** In separate tabs request `http://localhost:4101/api/events?date=2026-02-30` and `http://localhost:4101/api/events/11`; use Network to show HTTP 400 `INVALID_INPUT` and HTTP 404 `NOT_FOUND`. Then open `http://localhost:3000/event.html?id=abc` to show the client-side invalid-link message. Briefly show the terminal results of `npm test` and `npm run test:db` if those commands pass during the recording setup; rerun them if needed. Do not expose environment variables.

**Say in English / 英文口述:** “The API rejects an impossible date with a 400 invalid-input response. Event 11 is the suspended sample, so its public detail endpoint returns 404. The browser also catches a malformed event link before requesting details. These are deliberate paths, not browser crashes. The automated checks cover response shapes, bad inputs, query conditions, Sydney daylight-saving conversion and seed dates. The database integration check reads the seeded MySQL data and verifies public, suspended and expired-event visibility. I am showing the current command results rather than assuming that every environment will behave identically.”

**中文对照（不朗读）:** “API 对不存在的日期返回 400 和无效输入错误。活动 11 是暂停样例，因此公开详情返回 404。浏览器也会在请求前识别格式错误的活动链接。这些是预期错误路径，不是浏览器崩溃。自动检查覆盖响应结构、非法输入、查询条件、悉尼夏令时转换和样例日期。数据库集成检查读取真实 MySQL 样例，验证公开、暂停和过期活动的可见性。展示的是当前实际命令结果，不预设所有环境都完全相同。”

## 11:00–12:20 — Responsive view and limitations / 响应式布局与限制

**Screen actions / 屏幕操作:** Use browser device emulation to switch briefly to a narrow mobile width on the search or detail page. Scroll enough to show stacked cards or details, then return to desktop width. Finish on the home page.

**Say in English / 英文口述:** “The layout adapts to a narrower screen while keeping the navigation, filters and event information usable. The site also uses labelled form controls, status messages and a skip link. Its current scope is public discovery: there is no completed registration workflow, no editing interface, and no live payment processing. The sample event dates are fixed, so they must be refreshed when they pass. The next step for a real charity would be to add a secure registration service, moderation, accessibility testing with users, and operational deployment controls. This concludes the demonstration.”

**中文对照（不朗读）:** “布局会适应较窄屏幕，同时保持导航、筛选和活动信息可用。站点还包含表单标签、状态提示和跳转主内容链接。当前范围是公开活动发现：没有完整报名流程、编辑界面或实时支付。样例日期固定，过期后需要更新。真实慈善机构的后续工作包括安全报名服务、内容审核、用户参与的无障碍测试和部署运维控制。演示到此结束。”

**Recording reminder / 录制提醒:** Record only after confirming the live browser and commands match the script. If a result differs, describe what actually happened and correct the project or script before submitting. Submit the actual video separately through the required course channel; this file is only the narration and screen-action plan.
