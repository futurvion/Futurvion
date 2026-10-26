"use client";
import { siteStyles } from "@/config/styles";
export default function Error({ reset }: { reset: () => void }) { return <section className={`${siteStyles.pageSection} page-section`}><div className={`${siteStyles.container} jobs-empty`} role="alert">Jobs could not be loaded. <button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} onClick={reset}>Try again</button></div></section>; }
