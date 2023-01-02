use crate::payloads::payloads::TaskDonePayload;

pub fn handle_finish(nonce: u32) {
    // TODO: no time
    let task_done = TaskDonePayload { nonce, time: 0 };
    let j = serde_json::to_string(&task_done).unwrap();

    println!("{}", j);
}
