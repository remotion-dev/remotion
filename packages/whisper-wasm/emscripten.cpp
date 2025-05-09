#include "whisper.h"

#include <emscripten.h>
#include <emscripten/bind.h>
#include <iostream>
#include <vector>
#include <thread>

std::thread g_worker;

static inline int mpow2(int n) {
    int p = 1;
    while (p <= n) p *= 2;
    return p / 2;
}

static char * escape_double_quotes_and_backslashes(const char * str) {
    if (str == NULL) {
        return NULL;
    }

    size_t escaped_length = strlen(str) + 1;

    for (size_t i = 0; str[i] != '\0'; i++) {
        if (str[i] == '"' || str[i] == '\\') {
            escaped_length++;
        }
    }

    char * escaped = (char *)calloc(escaped_length, 1); // pre-zeroed
    if (escaped == NULL) {
        return NULL;
    }

    size_t pos = 0;
    for (size_t i = 0; str[i] != '\0'; i++) {
        if (str[i] == '"' || str[i] == '\\') {
            escaped[pos++] = '\\';
        }
        escaped[pos++] = str[i];
    }

    // no need to set zero due to calloc() being used prior

    return escaped;
}

//  500 -> 00:05.000
// 6000 -> 01:00.000
std::string to_timestamp(int64_t t, bool comma) {
    int64_t msec = t * 10;
    int64_t hr = msec / (1000 * 60 * 60);
    msec = msec - hr * (1000 * 60 * 60);
    int64_t min = msec / (1000 * 60);
    msec = msec - min * (1000 * 60);
    int64_t sec = msec / 1000;
    msec = msec - sec * 1000;

    char buf[32];
    snprintf(buf, sizeof(buf), "%02d:%02d:%02d%s%03d", (int) hr, (int) min, (int) sec, comma ? "," : ".", (int) msec);

    return std::string(buf);
}

static bool output_json(
             struct whisper_context * ctx,
                               bool   final,
                               int    first_segment,
                               int    n_segments) {
    int indent = 0;
    std::string output;


    auto doindent = [&]() {
        for (int i = 0; i < indent; i++) output += "\t";
    };

    auto start_arr = [&](const char *name) {
        doindent();
        output += "\"" + std::string(name) + "\": [";
        indent++;
    };

    auto end_arr = [&](bool end) {
        indent--;
        doindent();
        output += (end ? "]" : "],");
    };

    auto start_obj = [&](const char *name) {
        doindent();
        if (name) {
            output += "\"" + std::string(name) + "\": {";
        } else {
            output += "{";
        }
        indent++;
    };

    auto end_obj = [&](bool end) {
        indent--;
        doindent();
        output += (end ? "}" : "},");
    };

    auto start_value = [&](const char *name) {
        doindent();
        output += "\"" + std::string(name) + "\": ";
    };

    auto value_s = [&](const char *name, const char *val, bool end) {
        start_value(name);
        char * val_escaped = escape_double_quotes_and_backslashes(val);
        output += "\"" + std::string(val_escaped) + (end ? "\"" : "\",");
        free(val_escaped);
    };

    auto end_value = [&](bool end) {
        output += (end ? "" : ",");
    };

    auto value_i = [&](const char *name, const int64_t val, bool end) {
        start_value(name);
        output += std::to_string(val);
        end_value(end);
    };

    auto value_f = [&](const char *name, const float val, bool end) {
        start_value(name);
        output += std::to_string(val);
        end_value(end);
    };

    auto value_b = [&](const char *name, const bool val, bool end) {
        start_value(name);
        output += (val ? "true" : "false");
        end_value(end);
    };

    auto times_o = [&](int64_t t0, int64_t t1, bool end) {
        start_obj("timestamps");
        value_s("from", to_timestamp(t0, true).c_str(), false);
        value_s("to", to_timestamp(t1, true).c_str(), true);
        end_obj(false);
        start_obj("offsets");
        value_i("from", t0 * 10, false);
        value_i("to", t1 * 10, true);
        end_obj(end);
    };

    start_obj(nullptr);
        value_s("systeminfo", whisper_print_system_info(), false);
        start_obj("model");
            value_s("type", whisper_model_type_readable(ctx), false);
            value_b("multilingual", whisper_is_multilingual(ctx), false);
            value_i("vocab", whisper_model_n_vocab(ctx), false);
            start_obj("audio");
                value_i("ctx", whisper_model_n_audio_ctx(ctx), false);
                value_i("state", whisper_model_n_audio_state(ctx), false);
                value_i("head", whisper_model_n_audio_head(ctx), false);
                value_i("layer", whisper_model_n_audio_layer(ctx), true);
            end_obj(false);
            start_obj("text");
                value_i("ctx", whisper_model_n_text_ctx(ctx), false);
                value_i("state", whisper_model_n_text_state(ctx), false);
                value_i("head", whisper_model_n_text_head(ctx), false);
                value_i("layer", whisper_model_n_text_layer(ctx), true);
            end_obj(false);
            value_i("mels", whisper_model_n_mels(ctx), false);
            value_i("ftype", whisper_model_ftype(ctx), true);
        end_obj(false);
        start_obj("result");
            value_s("language", whisper_lang_str(whisper_full_lang_id(ctx)), true);
        end_obj(false);
        start_arr("transcription");

        for (int i = first_segment; i < n_segments; ++i) {
            const char * text = whisper_full_get_segment_text(ctx, i);

            const int64_t t0 = whisper_full_get_segment_t0(ctx, i);
            const int64_t t1 = whisper_full_get_segment_t1(ctx, i);

            start_obj(nullptr);
                times_o(t0, t1, false);
                value_s("text", text, false);

                start_arr("tokens");
                const int n = whisper_full_n_tokens(ctx, i);
                for (int j = 0; j < n; ++j) {
                    auto token = whisper_full_get_token_data(ctx, i, j);
                    start_obj(nullptr);
                        value_s("text", whisper_token_to_str(ctx, token.id), false);
                        if(token.t0 > -1 && token.t1 > -1) {
                            // If we have per-token timestamps, write them out
                            times_o(token.t0, token.t1, false);
                        }
                        value_i("id", token.id, false);
                        value_f("p", token.p, false);
                        value_f("t_dtw", token.t_dtw, true);
                    end_obj(j == (n - 1));
                }
                end_arr(true);

            end_obj(i == (n_segments - 1));
        }

        end_arr(true);
    end_obj(true);

    if (final) {
        printf("remotion_final:%s\n", output.c_str());
    } else {
        printf("remotion_update:%s\n", output.c_str());
    }

    return true;
}


void whisper_print_segment_callback(struct whisper_context * ctx, struct whisper_state * /*state*/, int n_new, void * user_data) {
    const int n_segments = whisper_full_n_segments(ctx);
    const int s0 = n_segments - n_new;

    if (s0 == 0) {
        printf("\n");
    }

    output_json(ctx, false, s0, n_segments);
}

// Define the progress callback function
void progress_callback(struct whisper_context * ctx, struct whisper_state * state, int progress, void * user_data) {    
    printf("remotion_progress:%d%%\n", progress);
}

std::vector<struct whisper_context *> g_contexts(1, nullptr);


EMSCRIPTEN_BINDINGS(whisper) {
    emscripten::function("full_default", emscripten::optional_override([](const std::string & path_model, const emscripten::val & audio, const std::string & model, const std::string & lang, int nthreads, bool translate) {
        if (g_contexts[0] != nullptr) {
            printf("remotion_busy:\n");
            return 0;
        }

        g_contexts[0] = whisper_init_from_file_with_params(path_model.c_str(), whisper_context_default_params());

        struct whisper_full_params params = whisper_full_default_params(whisper_sampling_strategy::WHISPER_SAMPLING_GREEDY);

        std::vector<float> pcmf32;

        params.print_realtime   = false;
        params.new_segment_callback = whisper_print_segment_callback;
        params.print_progress   = false;
        params.print_timestamps = false;
        params.print_special    = false;
        params.translate        = translate;
        params.token_timestamps = true;
        params.language         = lang.c_str(); // Convert std::string to const char*
        params.n_threads        = std::min(nthreads, std::min(16, mpow2(std::thread::hardware_concurrency())));
        params.offset_ms        = 0;
        params.progress_callback = progress_callback; // Assigning the callback

        const int n = audio["length"].as<int>();

        emscripten::val heap = emscripten::val::module_property("HEAPU8");
        emscripten::val memory = heap["buffer"];

        pcmf32.resize(n);

        emscripten::val memoryView = audio["constructor"].new_(memory, reinterpret_cast<uintptr_t>(pcmf32.data()), n);
        memoryView.call<void>("set", audio);

        // Print system information
        {
            printf("system_info: n_threads = %d / %d | %s\n",
                   params.n_threads, std::thread::hardware_concurrency(), whisper_print_system_info());

            printf("%s: processing %d samples, %.1f sec, %d threads, lang = %s, task = %s ...\n",
                   __func__, int(pcmf32.size()), float(pcmf32.size()) / WHISPER_SAMPLE_RATE,
                   params.n_threads,
                   params.language,
                   params.translate ? "translate" : "transcribe");

            printf("\n");
        }


        // Run the worker
        {
            g_worker = std::thread([params, pcm = std::move(pcmf32)]() {
                whisper_reset_timings(g_contexts[0]);
                whisper_full(g_contexts[0], params, pcm.data(), pcm.size());
                const int n_segments = whisper_full_n_segments(g_contexts[0]);
                output_json(g_contexts[0], true, 0, n_segments);
                whisper_free(g_contexts[0]);
                g_contexts[0] = nullptr;
            });
        }

        return 0;
    }));
}
