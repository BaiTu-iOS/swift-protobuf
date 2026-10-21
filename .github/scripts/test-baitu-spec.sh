#!/bin/bash
# Created by yuxilong on 2026/10/21.
set -euo pipefail
cd "$(dirname "$0")/../.."
fixture='{"name":"SwiftProtobuf","version":"1.39.0","resource_bundles":{"SwiftProtobuf":["Sources/SwiftProtobuf/PrivacyInfo.xcprivacy"]},"pod_target_xcconfig":{"OTHER_SWIFT_FLAGS":"-package-name SwiftProtobuf"}}'
echo "$fixture" | jq --arg version 1.39.0 -f .github/scripts/baitu-spec.jq | jq -e '
  .name == "BTSwiftProtobuf" and .module_name == "BTSwiftProtobuf"
  and .source.tag == "1.39.0" and .static_framework == true
  and .source.git == "https://github.com/BaiTu-iOS/swift-protobuf.git"
  and .resource_bundles.BTSwiftProtobuf == ["Sources/SwiftProtobuf/PrivacyInfo.xcprivacy"]
  and .resource_bundles.SwiftProtobuf == null
  and .pod_target_xcconfig.OTHER_SWIFT_FLAGS == "-package-name SwiftProtobuf"' >/dev/null
if echo "$fixture" | jq --arg version 1.40.0 -f .github/scripts/baitu-spec.jq 2>/dev/null; then
  echo 'Version mismatch must fail' >&2
  exit 1
fi
if echo "$fixture" | jq '.name="Other"' | jq --arg version 1.39.0 -f .github/scripts/baitu-spec.jq 2>/dev/null; then
  echo 'Unexpected upstream name must fail' >&2
  exit 1
fi
echo 'BTSwiftProtobuf spec transformation tests passed'
