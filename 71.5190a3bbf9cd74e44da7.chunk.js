(window.webpackJsonp=window.webpackJsonp||[]).push([[71],{363:function(n,e,s){"use strict";s.r(e),e.default='<blockquote class="tip">\n<p>本指南继续沿用 <a href="/guides/getting-started">起步</a> 和 <a href="/guides/output-management">管理输出</a> 中的示例代码。请确保你已熟悉这些指南中提供的示例。</p>\n</blockquote>\n<p>代码分离是 webpack 中最引人注目的特性之一。此特性能够把代码分离到不同的 bundle 中，然后可以按需加载或并行加载这些文件。代码分离可以用于获取更小的 bundle，以及控制资源加载优先级，如果使用合理，会极大影响加载时间。</p>\n<p>常用的代码分离方法有三种：</p>\n<ul>\n<li>入口起点：使用 <a href="/configuration/entry-context"><code>entry</code></a> 配置手动地分离代码。</li>\n<li>防止重复：使用 <a href="/plugins/split-chunks-plugin"><code>SplitChunksPlugin</code></a> 去重和分离 chunk。</li>\n<li>动态导入：通过模块的内联函数调用来分离代码。</li>\n</ul>\n<h2 id="入口起点entry-point">入口起点(entry point)<a href="#%E5%85%A5%E5%8F%A3%E8%B5%B7%E7%82%B9entry-point" aria-hidden="true"><span class="icon icon-link"></span></a></h2>\n<p>这是迄今为止最简单直观的分离代码的方式。不过，这种方式手动配置较多，并有一些隐患，我们将会解决这些问题。先来看看如何从 main bundle 中分离 another module(另一个模块)：</p>\n<p><strong>project</strong></p>\n<pre><code class="hljs language-diff">webpack-demo\n|- package.json\n|- webpack.config.js\n|- /dist\n|- /src\n  |- index.js\n<span class="token inserted">+ |- another-module.js</span>\n|- /node_modules</code></pre>\n<p><strong>another-module.js</strong></p>\n<pre><code class="hljs language-js"><span class="token keyword">import</span> _ <span class="token keyword">from</span> <span class="token string">\'lodash\'</span><span class="token punctuation">;</span>\n\nconsole<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>\n  _<span class="token punctuation">.</span><span class="token function">join</span><span class="token punctuation">(</span><span class="token punctuation">[</span><span class="token string">\'Another\'</span><span class="token punctuation">,</span> <span class="token string">\'module\'</span><span class="token punctuation">,</span> <span class="token string">\'loaded!\'</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token string">\' \'</span><span class="token punctuation">)</span>\n<span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n<p><strong>webpack.config.js</strong></p>\n<pre><code class="hljs language-diff">const path = require(\'path\');\n\nmodule.exports = {\n  mode: \'development\',\n  entry: {\n    index: \'./src/index.js\',\n<span class="token inserted">+   another: \'./src/another-module.js\',</span>\n  },\n  output: {\n    filename: \'[name].bundle.js\',\n    path: path.resolve(__dirname, \'dist\'),\n  },\n};</code></pre>\n<p>这将生成如下构建结果：</p>\n<pre><code class="hljs language-bash"><span class="token punctuation">..</span>.\n            Asset     Size   Chunks             Chunk Names\nanother.bundle.js  550 KiB  another  <span class="token punctuation">[</span>emitted<span class="token punctuation">]</span>  another\n  index.bundle.js  550 KiB    index  <span class="token punctuation">[</span>emitted<span class="token punctuation">]</span>  index\nEntrypoint index <span class="token operator">=</span> index.bundle.js\nEntrypoint another <span class="token operator">=</span> another.bundle.js\n<span class="token punctuation">..</span>.</code></pre>\n<p>正如前面提到的，这种方式存在一些隐患：</p>\n<ul>\n<li>如果入口 chunk 之间包含一些重复的模块，那些重复模块都会被引入到各个 bundle 中。</li>\n<li>这种方法不够灵活，并且不能动态地将核心应用程序逻辑中的代码拆分出来。</li>\n</ul>\n<p>以上两点中，第一点对我们的示例来说无疑是个问题，因为之前我们在 <code>./src/index.js</code> 中也引入过 <code>lodash</code>，这样就在两个 bundle 中造成重复引用。接着，我们通过使用 <a href="/plugins/split-chunks-plugin"><code>SplitChunksPlugin</code></a> 来移除重复的模块。</p>\n<h2 id="防止重复prevent-duplication">防止重复(prevent duplication)<a href="#%E9%98%B2%E6%AD%A2%E9%87%8D%E5%A4%8Dprevent-duplication" aria-hidden="true"><span class="icon icon-link"></span></a></h2>\n<h3 id="入口依赖">入口依赖<a href="#%E5%85%A5%E5%8F%A3%E4%BE%9D%E8%B5%96" aria-hidden="true"><span class="icon icon-link"></span></a></h3>\n<p>配置 <a href="/configuration/entry-context/#dependencies"><code>dependOn</code> option</a> 选项，这样可以在多个 chunk 之间共享模块。</p>\n<pre><code class="hljs language-diff">  const path = require(\'path\');\n\n  module.exports = {\n    mode: \'development\',\n    entry: {\n<span class="token deleted">-     index: \'./src/index.js\',</span>\n<span class="token deleted">-     another: \'./src/another-module.js\',</span>\n<span class="token inserted">+     index: { import: \'./src/index.js\', dependOn: \'shared\' },</span>\n<span class="token inserted">+     another: { import: \'./src/another-module.js\', dependOn: \'shared\' },</span>\n<span class="token inserted">+     shared: \'lodash\',</span>\n    },\n    output: {\n      filename: \'[name].bundle.js\',\n      path: path.resolve(__dirname, \'dist\'),\n    },\n  };</code></pre>\n<h3 id="splitchunksplugin"><code>SplitChunksPlugin</code><a href="#splitchunksplugin" aria-hidden="true"><span class="icon icon-link"></span></a></h3>\n<p><a href="/plugins/split-chunks-plugin"><code>SplitChunksPlugin</code></a> 插件可以将公共的依赖模块提取到已有的入口 chunk 中，或者提取到一个新生成的 chunk。让我们使用这个插件，将之前的示例中重复的 <code>lodash</code> 模块去除：</p>\n<blockquote class="warning">\n<p>CommonsChunkPlugin 已经从 webpack v4 legato 中移除。想要了解在最新版本中如何处理 chunks，请查看 <a href="/plugins/split-chunks-plugin"><code>SplitChunksPlugin</code></a> 。</p>\n</blockquote>\n<p><strong>webpack.config.js</strong></p>\n<pre><code class="hljs language-diff">  const path = require(\'path\');\n\n  module.exports = {\n    mode: \'development\',\n    entry: {\n      index: \'./src/index.js\',\n      another: \'./src/another-module.js\',\n    },\n    output: {\n      filename: \'[name].bundle.js\',\n      path: path.resolve(__dirname, \'dist\'),\n    },\n<span class="token inserted">+   optimization: {</span>\n<span class="token inserted">+     splitChunks: {</span>\n<span class="token inserted">+       chunks: \'all\',</span>\n<span class="token inserted">+     },</span>\n<span class="token inserted">+   },</span>\n  };</code></pre>\n<p>使用 <a href="/plugins/split-chunks-plugin/#optimization-splitchunks"><code>optimization.splitChunks</code></a> 配置选项之后，现在应该可以看出，<code>index.bundle.js</code> 和 <code>another.bundle.js</code> 中已经移除了重复的依赖模块。需要注意的是，插件将 <code>lodash</code> 分离到单独的 chunk，并且将其从 main bundle 中移除，减轻了大小。执行 <code>npm run build</code> 查看效果：</p>\n<pre><code class="hljs language-bash"><span class="token punctuation">..</span>.\n                          Asset      Size                 Chunks             Chunk Names\n              another.bundle.js  5.95 KiB                another  <span class="token punctuation">[</span>emitted<span class="token punctuation">]</span>  another\n                index.bundle.js  5.89 KiB                  index  <span class="token punctuation">[</span>emitted<span class="token punctuation">]</span>  index\nvendors~another~index.bundle.js   547 KiB  vendors~another~index  <span class="token punctuation">[</span>emitted<span class="token punctuation">]</span>  vendors~another~index\nEntrypoint index <span class="token operator">=</span> vendors~another~index.bundle.js index.bundle.js\nEntrypoint another <span class="token operator">=</span> vendors~another~index.bundle.js another.bundle.js\n<span class="token punctuation">..</span>.</code></pre>\n<p>以下是由社区提供，一些对于代码分离很有帮助的 plugin 和 loader：</p>\n<ul>\n<li><a href="plugins/mini-css-extract-plugin"><code>mini-css-extract-plugin</code></a>: 用于将 CSS 从主应用程序中分离。</li>\n</ul>\n<h2 id="动态导入dynamic-import">动态导入(dynamic import)<a href="#%E5%8A%A8%E6%80%81%E5%AF%BC%E5%85%A5dynamic-import" aria-hidden="true"><span class="icon icon-link"></span></a></h2>\n<p>当涉及到动态代码拆分时，webpack 提供了两个类似的技术。第一种，也是推荐选择的方式是，使用符合 <a href="https://github.com/tc39/proposal-dynamic-import">ECMAScript 提案</a> 的 <a href="/api/module-methods/#import-1"><code>import()</code> 语法</a> 来实现动态导入。第二种，则是 webpack 的遗留功能，使用 webpack 特定的 <a href="/api/module-methods/#requireensure"><code>require.ensure</code></a>。让我们先尝试使用第一种……</p>\n<blockquote class="warning">\n<p><code>import()</code> 调用会在内部用到 <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise">promises</a>。如果在旧版本浏览器中使用 <code>import()</code>，记得使用一个 polyfill 库（例如 <a href="https://github.com/stefanpenner/es6-promise">es6-promise</a> 或 <a href="https://github.com/taylorhakes/promise-polyfill">promise-polyfill</a>），来 shim <code>Promise</code>。</p>\n</blockquote>\n<p>在我们开始之前，先从配置中移除掉多余的 <a href="/concepts/entry-points/"><code>entry</code></a> 和 <a href="/plugins/split-chunks-plugin/#optimization-splitchunks"><code>optimization.splitChunks</code></a>，因为接下来的演示中并不需要它们：</p>\n<p><strong>webpack.config.js</strong></p>\n<pre><code class="hljs language-diff">  const path = require(\'path\');\n\n  module.exports = {\n    mode: \'development\',\n    entry: {\n      index: \'./src/index.js\',\n<span class="token deleted">-     another: \'./src/another-module.js\',</span>\n    },\n    output: {\n      filename: \'[name].bundle.js\',\n<span class="token inserted">+     chunkFilename: \'[name].bundle.js\',</span>\n      publicPath: \'dist/\',\n      path: path.resolve(__dirname, \'dist\'),\n    },\n<span class="token deleted">-   optimization: {</span>\n<span class="token deleted">-     splitChunks: {</span>\n<span class="token deleted">-       chunks: \'all\',</span>\n<span class="token deleted">-     },</span>\n<span class="token deleted">-   },</span>\n  };</code></pre>\n<p>注意，这里使用了 <code>chunkFilename</code>，它决定 non-entry chunk(非入口 chunk) 的名称。关于 <code>chunkFilename</code> 更多信息，请查看 <a href="/configuration/output/#outputchunkfilename">输出</a> 文档。更新我们的项目，移除现在不会用到的文件：</p>\n<p><strong>project</strong></p>\n<pre><code class="hljs language-diff">webpack-demo\n|- package.json\n|- webpack.config.js\n|- /dist\n|- /src\n  |- index.js\n<span class="token deleted">- |- another-module.js</span>\n|- /node_modules</code></pre>\n<p>现在，我们不再使用 statically import(静态导入) <code>lodash</code>，而是通过 dynamic import(动态导入) 来分离出一个 chunk：</p>\n<p><strong>src/index.js</strong></p>\n<pre><code class="hljs language-diff"><span class="token deleted">- import _ from \'lodash\';</span>\n<span class="token deleted">-</span>\n<span class="token deleted">- function component() {</span>\n<span class="token inserted">+ function getComponent() {</span>\n<span class="token deleted">-   const element = document.createElement(\'div\');</span>\n<span class="token deleted">-</span>\n<span class="token deleted">-   // Lodash, now imported by this script</span>\n<span class="token deleted">-   element.innerHTML = _.join([\'Hello\', \'webpack\'], \' \');</span>\n<span class="token inserted">+   return import(/* webpackChunkName: "lodash" */ \'lodash\').then(({ default: _ }) => {</span>\n<span class="token inserted">+     const element = document.createElement(\'div\');</span>\n<span class="token inserted">+</span>\n<span class="token inserted">+     element.innerHTML = _.join([\'Hello\', \'webpack\'], \' \');</span>\n<span class="token inserted">+</span>\n<span class="token inserted">+     return element;</span>\n<span class="token inserted">+</span>\n<span class="token inserted">+   }).catch(error => \'An error occurred while loading the component\');</span>\n  }\n\n<span class="token deleted">- document.body.appendChild(component());</span>\n<span class="token inserted">+ getComponent().then(component => {</span>\n<span class="token inserted">+   document.body.appendChild(component);</span>\n<span class="token inserted">+ })</span></code></pre>\n<p>我们之所以需要 <code>default</code>，是因为 webpack 4 在导入 CommonJS 模块时，将不再解析为 <code>module.exports</code> 的值，而是为 CommonJS 模块创建一个 artificial namespace 对象，更多有关背后原因的信息，请阅读 <a href="https://medium.com/webpack/webpack-4-import-and-commonjs-d619d626b655">webpack 4: import() and CommonJs</a></p>\n<p>注意，在注释中使用了 <code>webpackChunkName</code>。这样做会导致我们的 bundle 被命名为 <code>lodash.bundle.js</code> ，而不是 <code>[id].bundle.js</code> 。想了解更多关于 <code>webpackChunkName</code> 和其他可用选项，请查看 <a href="/api/module-methods/#import-1"><code>import()</code> 相关文档</a>。让我们执行 webpack，查看 <code>lodash</code> 是否会分离到一个单独的 bundle：</p>\n<pre><code class="hljs language-bash"><span class="token punctuation">..</span>.\n                   Asset      Size          Chunks             Chunk Names\n         index.bundle.js  7.88 KiB           index  <span class="token punctuation">[</span>emitted<span class="token punctuation">]</span>  index\nvendors~lodash.bundle.js   547 KiB  vendors~lodash  <span class="token punctuation">[</span>emitted<span class="token punctuation">]</span>  vendors~lodash\nEntrypoint index <span class="token operator">=</span> index.bundle.js\n<span class="token punctuation">..</span>.</code></pre>\n<p>由于 <code>import()</code> 会返回一个 promise，因此它可以和 <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function"><code>async</code> 函数</a>一起使用。但是，需要使用像 Babel 这样的预处理器和 <a href="https://babel.docschina.org/docs/plugins/syntax-dynamic-import/#installation">Syntax Dynamic Import Babel Plugin</a>。下面是如何通过 async 函数简化代码：</p>\n<p><strong>src/index.js</strong></p>\n<pre><code class="hljs language-diff"><span class="token deleted">- function getComponent() {</span>\n<span class="token inserted">+ async function getComponent() {</span>\n<span class="token deleted">-   return import(/* webpackChunkName: "lodash" */ \'lodash\').then(({ default: _ }) => {</span>\n<span class="token deleted">-     const element = document.createElement(\'div\');</span>\n<span class="token deleted">-</span>\n<span class="token deleted">-     element.innerHTML = _.join([\'Hello\', \'webpack\'], \' \');</span>\n<span class="token deleted">-</span>\n<span class="token deleted">-     return element;</span>\n<span class="token deleted">-</span>\n<span class="token deleted">-   }).catch(error => \'An error occurred while loading the component\');</span>\n<span class="token inserted">+   const element = document.createElement(\'div\');</span>\n<span class="token inserted">+   const { default: _ } = await import(/* webpackChunkName: "lodash" */ \'lodash\');</span>\n<span class="token inserted">+</span>\n<span class="token inserted">+   element.innerHTML = _.join([\'Hello\', \'webpack\'], \' \');</span>\n<span class="token inserted">+</span>\n<span class="token inserted">+   return element;</span>\n  }\n\n  getComponent().then(component => {\n    document.body.appendChild(component);\n  });</code></pre>\n<blockquote class="tip">\n<p>在稍后示例中，可能会根据计算后的变量(computed variable)导入特定模块时，可以通过向 <code>import()</code> 传入一个 <a href="/api/module-methods/#dynamic-expressions-in-import">动态表达式</a>。</p>\n</blockquote>\n<h2 id="预获取预加载模块prefetchpreload-module">预获取/预加载模块(prefetch/preload module)<a href="#%E9%A2%84%E8%8E%B7%E5%8F%96%E9%A2%84%E5%8A%A0%E8%BD%BD%E6%A8%A1%E5%9D%97prefetchpreload-module" aria-hidden="true"><span class="icon icon-link"></span></a></h2>\n<p>webpack v4.6.0+ 增加了对预获取和预加载的支持。</p>\n<p>在声明 import 时，使用下面这些内置指令，可以让 webpack 输出 "resource hint(资源提示)"，来告知浏览器：</p>\n<ul>\n<li>prefetch(预获取)：将来某些导航下可能需要的资源</li>\n<li>preload(预加载)：当前导航下可能需要资源</li>\n</ul>\n<p>下面这个 prefetch 的简单示例中，有一个 <code>HomePage</code> 组件，其内部渲染一个 <code>LoginButton</code> 组件，然后在点击后按需加载 <code>LoginModal</code> 组件。</p>\n<p><strong>LoginButton.js</strong></p>\n<pre><code class="hljs language-js"><span class="token comment">//...</span>\n<span class="token keyword">import</span><span class="token punctuation">(</span><span class="token comment">/* webpackPrefetch: true */</span> <span class="token string">\'LoginModal\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n<p>这会生成 <code>&#x3C;link rel="prefetch" href="login-modal-chunk.js"></code> 并追加到页面头部，指示着浏览器在闲置时间预取 <code>login-modal-chunk.js</code> 文件。</p>\n<blockquote class="tip">\n<p>只要父 chunk 完成加载，webpack 就会添加 prefetch hint(预取提示)。</p>\n</blockquote>\n<p>与 prefetch 指令相比，preload 指令有许多不同之处：</p>\n<ul>\n<li>preload chunk 会在父 chunk 加载时，以并行方式开始加载。prefetch chunk 会在父 chunk 加载结束后开始加载。</li>\n<li>preload chunk 具有中等优先级，并立即下载。prefetch chunk 在浏览器闲置时下载。</li>\n<li>preload chunk 会在父 chunk 中立即请求，用于当下时刻。prefetch chunk 会用于未来的某个时刻。</li>\n<li>浏览器支持程度不同。</li>\n</ul>\n<p>下面这个简单的 preload 示例中，有一个 <code>Component</code>，依赖于一个较大的 library，所以应该将其分离到一个独立的 chunk 中。</p>\n<p>我们假想这里的图表组件 <code>ChartComponent</code> 组件需要依赖体积巨大的 <code>ChartingLibrary</code> 库。它会在渲染时显示一个 <code>LoadingIndicator(加载进度条)</code> 组件，然后立即按需导入 <code>ChartingLibrary</code>：</p>\n<p><strong>ChartComponent.js</strong></p>\n<pre><code class="hljs language-js"><span class="token comment">//...</span>\n<span class="token keyword">import</span><span class="token punctuation">(</span><span class="token comment">/* webpackPreload: true */</span> <span class="token string">\'ChartingLibrary\'</span><span class="token punctuation">)</span><span class="token punctuation">;</span></code></pre>\n<p>在页面中使用 <code>ChartComponent</code> 时，在请求 ChartComponent.js 的同时，还会通过 <code>&#x3C;link rel="preload"></code> 请求 charting-library-chunk。假定 page-chunk 体积很小，很快就被加载好，页面此时就会显示 <code>LoadingIndicator(加载进度条)</code> ，等到 <code>charting-library-chunk</code> 请求完成，LoadingIndicator 组件才消失。启动仅需要很少的加载时间，因为只进行单次往返，而不是两次往返。尤其是在高延迟环境下。</p>\n<blockquote class="tip">\n<p>不正确地使用 webpackPreload 会有损性能，请谨慎使用。</p>\n</blockquote>\n<h2 id="bundle-分析bundle-analysis">bundle 分析(bundle analysis)<a href="#bundle-%E5%88%86%E6%9E%90bundle-analysis" aria-hidden="true"><span class="icon icon-link"></span></a></h2>\n<p>一旦开始分离代码，一件很有帮助的事情是，分析输出结果来检查模块在何处结束。 <a href="https://github.com/webpack/analyse">官方分析工具</a> 是一个不错的开始。还有一些其他社区支持的可选项：</p>\n<ul>\n<li><a href="https://alexkuz.github.io/webpack-chart/">webpack-chart</a>: webpack stats 可交互饼图。</li>\n<li><a href="https://chrisbateman.github.io/webpack-visualizer/">webpack-visualizer</a>: 可视化并分析你的 bundle，检查哪些模块占用空间，哪些可能是重复使用的。</li>\n<li><a href="https://github.com/webpack-contrib/webpack-bundle-analyzer">webpack-bundle-analyzer</a>：一个 plugin 和 CLI 工具，它将 bundle 内容展示为一个便捷的、交互式、可缩放的树状图形式。</li>\n<li><a href="https://webpack.jakoblind.no/optimize">webpack bundle optimize helper</a>：这个工具会分析你的 bundle，并提供可操作的改进措施，以减少 bundle 的大小。</li>\n<li><a href="https://github.com/bundle-stats/bundle-stats">bundle-stats</a>：生成一个 bundle 报告（bundle 大小、资源、模块），并比较不同构建之间的结果。</li>\n</ul>\n<h2 id="下一步">下一步<a href="#%E4%B8%8B%E4%B8%80%E6%AD%A5" aria-hidden="true"><span class="icon icon-link"></span></a></h2>\n<p>接下来，查看 <a href="/guides/lazy-loading/">延迟加载</a> 来学习如何在实际一个真实应用程序中使用 <code>import()</code> 的具体示例，以及查看 <a href="/guides/caching/">缓存</a> 来学习如何有效地分离代码。</p>\n'}}]);