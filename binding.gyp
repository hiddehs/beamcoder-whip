{
  "targets": [{
    "target_name" : "beamcoder",
    "sources" : [ "src/beamcoder.cc", "src/beamcoder_util.cc",
                  "src/log.cc" ,
                  "src/governor.cc", "src/demux.cc",
                  "src/decode.cc", "src/filter.cc",
                  "src/encode.cc", "src/mux.cc",
                  "src/packet.cc", "src/frame.cc",
                  "src/codec_par.cc", "src/format.cc",
                  "src/codec.cc", "src/hwcontext.cc"],
    "conditions": [
      ['OS!="win"', {
        "defines": [
          "__STDC_CONSTANT_MACROS"
        ],
        "cflags_cc!": [
          "-fno-rtti",
          "-fno-exceptions"
        ],
        "cflags_cc": [
          "-std=c++11",
          "-fexceptions"
        ]
      }],
      ['OS!="win" and OS!="linux"', {
        "link_settings": {
          "libraries": [
            "-lavcodec",
            "-lavdevice",
            "-lavfilter",
            "-lavformat",
            "-lavutil",
            "-lpostproc",
            "-lswresample",
            "-lswscale"
          ]
        }
      }],
      ['OS=="win"', {
        "configurations": {
          "Release": {
            "msvs_settings": {
              "VCCLCompilerTool": {
                "RuntimeTypeInfo": "true"
              }
            }
          }
        },
        "include_dirs" : [
          "ffmpeg/ffmpeg-5.x-win64-shared/include"
        ],
        "libraries": [
          "-l../ffmpeg/ffmpeg-5.x-win64-shared/bin/avcodec",
          "-l../ffmpeg/ffmpeg-5.x-win64-shared/bin/avdevice",
          "-l../ffmpeg/ffmpeg-5.x-win64-shared/bin/avfilter",
          "-l../ffmpeg/ffmpeg-5.x-win64-shared/bin/avformat",
          "-l../ffmpeg/ffmpeg-5.x-win64-shared/bin/avutil",
          "-l../ffmpeg/ffmpeg-5.x-win64-shared/bin/postproc",
          "-l../ffmpeg/ffmpeg-5.x-win64-shared/bin/swresample",
          "-l../ffmpeg/ffmpeg-5.x-win64-shared/bin/swscale"
        ],
        "copies": [
            {
              "destination": "build/Release/",
              "files": [
                "ffmpeg/ffmpeg-5.x-win64-shared/bin/avcodec-59.dll",
                "ffmpeg/ffmpeg-5.x-win64-shared/bin/avdevice-59.dll",
                "ffmpeg/ffmpeg-5.x-win64-shared/bin/avfilter-8.dll",
                "ffmpeg/ffmpeg-5.x-win64-shared/bin/avformat-59.dll",
                "ffmpeg/ffmpeg-5.x-win64-shared/bin/avutil-57.dll",
                "ffmpeg/ffmpeg-5.x-win64-shared/bin/postproc-56.dll",
                "ffmpeg/ffmpeg-5.x-win64-shared/bin/swresample-4.dll",
                "ffmpeg/ffmpeg-5.x-win64-shared/bin/swscale-6.dll"
              ]
            }
          ]
    }],
    ['OS=="linux"', {
      "libraries": [
        "<!(pkg-config --libs libavcodec)",
        "<!(pkg-config --libs libavdevice)",
        "<!(pkg-config --libs libavfilter)",
        "<!(pkg-config --libs libavformat)",
        "<!(pkg-config --libs libavutil)",
        "<!(pkg-config --libs libpostproc)",
        "<!(pkg-config --libs libswresample)",
        "<!(pkg-config --libs libswscale)"
      ]
    }],
    ['OS=="mac"', {
    "copies":[{
        "destination":"<(PRODUCT_DIR)/lib",
        "files":[
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib/libavcodec.60.dylib",
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib/libavdevice.60.dylib",
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib/libavfilter.9.dylib",
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib/libavformat.60.dylib",
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib/libavutil.58.dylib",
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib/libpostproc.57.dylib",
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib/libswresample.4.dylib",
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib/libswscale.7.dylib",
        ]
    }],
    "link_settings": {
          "libraries": [
            "-Wl,-rpath,@loader_path/lib"
          ],
          "library_dirs": [
            "<(module_root_dir)/ffmpeg/macos-out/usr/local/lib",
          ]
      },
      "include_dirs" : [
        "ffmpeg/macos-out/usr/local/include",
      ],
    }],
  ]
}]
}
