"use client";
export default function Error({ reset }: { reset: () => void }) { return <section className="page-section"><div className="container jobs-empty" role="alert">Jobs could not be loaded. <button className="button button-primary" onClick={reset}>Try again</button></div></section>; }
