# BTSwiftProtobuf 发布

每 6 小时检测 `apple/swift-protobuf` 的正式 GitHub Release，从 1.39.0 开始补齐版本，跳过预发布。同步对应原始 tag，不覆盖已存在的不同 tag，也不重置 main；main 用于保存本仓库的自动化配置。

`.github/workflows/publish-baitu.yml` 从对应 tag 的原始 podspec 生成 `BTSwiftProtobuf`，保留上游编译参数、平台和源码配置，独立设置 Swift 模块及隐私资源 bundle 名称，并使用静态 framework。通过 CocoaPods iOS 编译验证后，发布包含 JSON podspec 和 SHA-256 的 GitHub Release。已发布版本不可覆盖；未完成的 draft 可以重试。

`BaiTu-iOS/baitu-specs` 的 `sync-btswiftprotobuf.yml` 每小时校验并拉取这些产物，写入 `BTSwiftProtobuf/<版本>/BTSwiftProtobuf.podspec.json`。两个 workflow 都支持手动运行，不需要跨仓库 PAT。

fork 使用仅对本仓库有写权限的 SSH deploy key 同步 tag，私钥保存在 Actions secret `UPSTREAM_SYNC_SSH_KEY`。这是因为上游 tag 包含 workflow 文件，默认 `GITHUB_TOKEN` 无权创建这些引用。Release API 和 specs 入库仍使用各自仓库的 `GITHUB_TOKEN`。轮换时同时更新 deploy key 与对应 secret。

```ruby
source 'https://github.com/BaiTu-iOS/baitu-specs.git'
source 'https://cdn.cocoapods.org/'
pod 'BTSwiftProtobuf', '1.39.0'
```

应用侧使用 `import BTSwiftProtobuf`。已有生成代码使用 `SwiftProtobuf` 时，编译该生成代码的 target 需要设置 `-module-alias SwiftProtobuf=BTSwiftProtobuf`。

自动化只验证 iOS，不自动修改业务组件的版本约束。上游新增正式版本后，最迟约 7 小时加 CI 执行时间进入 specs；GitHub 定时调度可能延迟，长期无活动的公开仓库定时任务可能被停用，可在 Actions 页面重新启用。
