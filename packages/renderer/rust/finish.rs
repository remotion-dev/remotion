use crate::payloads::payloads::TaskDonePayload;

pub fn handle_finish(nonce: u32) {
    // TODO: no time
    let task_done = TaskDonePayload {
        nonce,
        time: 0,
        msg_type: "finish".to_string(),
    };
    let j = serde_json::to_string(&task_done).unwrap();

    print!("--debug-start--{}--debug-end--\n", j);
}
