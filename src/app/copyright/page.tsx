export default function CopyrightPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <p className="text-sm font-medium text-accent">公开规则</p>
        <h1 className="mt-1 text-3xl font-bold">版权政策</h1>
        <p className="mt-3 text-neutral-600 dark:text-neutral-300">我们先核验权利信息，再决定书籍是否向公众开放。此政策适用于图书馆中的书籍、文件与 AI 阅读功能。</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">书籍审核状态</h2>
        <p className="text-neutral-600 dark:text-neutral-300">每本书均有明确的审核状态。只有“审核通过”的书籍可以对公众展示和阅读；其他状态均不可公开。</p>
        <ul className="space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <li><strong>待审核：</strong>尚未完成来源、许可或公版依据核验，不公开。</li>
          <li><strong>审核通过：</strong>核验完成并允许按记录的许可范围公开。</li>
          <li><strong>授权存疑：</strong>权利依据存在疑问，暂停公开并继续核查。</li>
          <li><strong>收到投诉（临时下架）：</strong>投诉核查期间先行停止公开。</li>
          <li><strong>审核撤销（永久移除）：</strong>审核结论被撤销，书籍从公开目录移除。</li>
        </ul>
        <p className="text-neutral-600 dark:text-neutral-300">书籍详情应展示可核验的来源、许可和署名信息；公开许可范围不代表超出该范围的使用也获准。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">投诉与下架</h2>
        <ol className="list-decimal space-y-2 pl-5 text-neutral-600 dark:text-neutral-300">
          <li>权利人或其授权代表应准备书名或链接、权利依据、联系信息及所请求的处理方式。目前网站尚未展示专用投诉渠道；运营者应在正式公开前公布可用的联系渠道。</li>
          <li>收到投诉后，我们会记录并核验材料；在核查期间，可先将相关书籍设为“收到投诉（临时下架）”并停止公开访问。</li>
          <li>核验后会根据材料恢复公开、继续限制访问或撤销审核并移除书籍，并保留处理记录。</li>
          <li>如需补充材料或对处理结果提出异议，应使用运营者公布的联系渠道继续沟通。</li>
        </ol>
        <p className="text-sm text-neutral-500">目前网站没有内置版权投诉表单，请使用站点运营者公布的官方联系渠道。</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">AI 阅读边界</h2>
        <p className="text-neutral-600 dark:text-neutral-300">仅在权利记录允许 AI 处理时，相关书籍才可用于 AI 功能。AI 用于摘要、解释、阅读辅助和必要的短引用；不提供整章或整本书的逐字输出，也不绕过书籍审核状态或授权范围。</p>
      </section>

      <p className="border-t border-neutral-200 pt-4 text-xs text-neutral-500 dark:border-neutral-700">遇到来源或权利信息有误，请使用运营者公布的联系渠道告知，以便复核；目前网站尚未展示专用联系地址。</p>
    </article>
  );
}
