// Fork flag: this build is personal/local-only. Cloud account, billing,
// and upsell surfaces are hidden when true. Gate with one-line
// conditionals so upstream files stay minimally diverged.
export const LOCAL_ONLY = true as const;
