/** Customer numbers shown on the homepage results band and the proof panel
 *  on inner pages. One source so the figures never drift apart. */
export const PROOF_STATS = [
  { value: "300+", label: "Customers", note: "Founders and small sales teams running outbound on Omentir." },
  { value: "110k+", label: "Conversations started", note: "LinkedIn conversations opened by Omentir agents so far." },
  { value: "7000+", label: "Meetings booked", note: "Calls booked from replies that came through the inbox." },
] as const;
