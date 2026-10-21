# Created by yuxilong on 2026/10/21.
if .name != "SwiftProtobuf" or .version != $version then
  error("Upstream spec does not match the release")
else
  .name = "BTSwiftProtobuf"
  | .module_name = "BTSwiftProtobuf"
  | .homepage = "https://github.com/BaiTu-iOS/swift-protobuf"
  | .source = {git: "https://github.com/BaiTu-iOS/swift-protobuf.git", tag: $version}
  | .static_framework = true
  | .resource_bundles |= with_entries(
      if .key == "SwiftProtobuf" then .key = "BTSwiftProtobuf" else . end
    )
end
