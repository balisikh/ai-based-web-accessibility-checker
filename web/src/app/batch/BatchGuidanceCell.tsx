import type { BatchSiteGuidanceView } from "@/lib/website-batch-guidance";
import Link from "next/link";

export function BatchGuidanceCell({ guidance }: { guidance: BatchSiteGuidanceView }) {
  return (
    <div
      className={`batch-guidance batch-guidance-${guidance.pass ? "pass" : "fail"}`}
    >
      <p className="batch-guidance-kicker">{guidance.kicker}</p>
      {guidance.note ? (
        <p className="batch-guidance-note">
          <span className="batch-guidance-note-label">Note</span>{" "}
          {guidance.note}
        </p>
      ) : null}
      <ul className="batch-guidance-list">
        {guidance.recommendations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {!guidance.pass && (
        <p className="batch-guidance-footer">
          Re-scan in <Link href="/">Lumen</Link> for live rule detail.
        </p>
      )}
      {guidance.pass && guidance.hasFollowUpWork && (
        <p className="batch-guidance-footer">
          Still a batch <strong>Pass</strong> — re-scan in{" "}
          <Link href="/">Lumen</Link> after fixes so critical stays 0.
        </p>
      )}
    </div>
  );
}
