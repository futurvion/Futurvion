import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
export default function NotFound() { return <section className="inner-hero" style={{minHeight:"70vh",display:"flex",alignItems:"center"}}><div className="container"><span className="eyebrow">404 / NOT FOUND</span><h1>That page took a<br/><em>different path.</em></h1><p>The link may have moved. Let’s get you back to a useful place.</p><Link className="button button-primary" href="/">Return home <ArrowUpRight size={17}/></Link></div></section>; }
