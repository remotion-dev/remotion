import React, { useCallback, useState } from "react";
import { BlueButton } from "../layout/Button";
import { Spacer } from "../layout/Spacer";
import { CoolInput } from "../TextInput";
import styles from "./newsletter.module.css";

export const NewsletterButton: React.FC<{}> = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      try {
        setSubmitting(true);
        e.preventDefault();

        const response = await fetch("/api/newsletter", {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: {
            "content-type": "application/json",
          },
        });
        const json = await response.json();
        if (json.success) {
          setSubscribed(true);
        } else {
          // eslint-disable-next-line no-alert
          alert("Something went wrong. Please try again later.");
        }

        setSubmitting(false);
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert("Something went wrong. Please try again later.");
      }
    },
    [email]
  );

  return (
    <div>
      <div className={styles.newslettergrow}>
        <div className={styles.portion}>
          <div className={styles.panel}>
            <div className={[styles.tablenewsletter].join(" ")}>Newsletter</div>
            <form
              onSubmit={handleSubmit}
              style={{
                width: "100%",
              }}
            >
              <p>
                Read about new features and all noteworthy updates we have made
                on Remotion once in a while.
              </p>

              <CoolInput
                style={{
                  width: "100%",
                }}
                disabled={submitting}
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type={"email"}
                required
                placeholder="animator@gmail.com"
              />
              <Spacer />
              <Spacer />
              <div>
                <BlueButton
                  type="submit"
                  fullWidth
                  loading={submitting}
                  disabled={submitting || subscribed}
                  size="bg"
                >
                  {subscribed ? "Subscribed!" : "Subscribe"}
                </BlueButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
