export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-sm font-medium text-accent">数据与账户</p>
        <h1 className="mt-1 text-3xl font-bold">隐私政策</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-300">本页说明图书馆当前版本处理哪些个人数据、数据保存位置，以及现有的数据清理方式。</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">我们处理的数据</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-600 dark:text-neutral-300">
          <li>邮箱登录所需的邮箱地址和认证状态；Supabase Auth 启用时由 Supabase 处理认证。</li>
          <li>阅读进度、阅读历史和收藏，用于继续阅读及个人书架功能。</li>
          <li>昵称、阅读计划和界面/阅读器偏好设置，用于个性化显示。</li>
        </ul>
        <p className="text-neutral-600 dark:text-neutral-300">本政策不承诺未实现的匿名化、保留期限或第三方处理安排。网站配置 AI 服务时，向 AI 路由提交的提问和必要上下文可能由所配置的服务处理；请勿在提问中填写敏感个人信息。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">数据保存位置</h2>
        <p className="text-neutral-600 dark:text-neutral-300">未配置 Supabase 时，网站以本地演示模式运行，个人数据保存在当前浏览器的本地存储中，不会因此自动同步到云端。</p>
        <p className="text-neutral-600 dark:text-neutral-300">配置 Supabase 后，邮箱认证由 Supabase Auth 处理；数据库可保存账号资料、阅读进度、历史和收藏等数据，并按账号隔离。部分个人偏好仍可能保存在浏览器本地。实际启用哪些云端功能取决于部署配置。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">删除和清理</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-600 dark:text-neutral-300">
          <li><strong>本地演示数据：</strong>可在“个人中心”使用清除本地数据功能，或在浏览器设置中清除此网站的数据。清除浏览器数据只影响该浏览器。</li>
          <li><strong>云端个人数据：</strong>当前界面没有自动删除 Supabase 账号及其云端记录的功能。目前网站尚未展示专用的云端删除申请渠道；正式公开前应公布处理方式。在此之前，仅从浏览器退出或清除本地数据不会删除云端记录。</li>
          <li>网站代码中的账号删除操作目前只清理浏览器本地存储，并不调用 Supabase 删除账号；请勿将其视为云端账号注销。</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">政策更新与联系</h2>
        <p className="text-neutral-600 dark:text-neutral-300">数据处理方式发生变化时，应同步更新本页。目前网站尚未展示专用的个人数据联系渠道；正式公开前应公布处理方式。</p>
      </section>
    </article>
  );
}
