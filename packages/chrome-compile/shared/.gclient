solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git",
    "managed": False,
    "deps_file": "DEPS",
    "custom_deps": {
    },
    "custom_vars": {
      "checkout_nacl": False,
      "checkout_configuration": "small",
      "checkout_js_coverage_modules": False,
      "checkout_fuchsia_boot_images": ""
    },
  }
]
