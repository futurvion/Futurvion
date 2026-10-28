import Link from "next/link";
import { JsonLd } from "@/components/shared/json-ld";
import { siteStyles } from "@/config/styles";
import { breadcrumbJsonLd } from "@/lib/seo";

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <>
      <nav
        className={`${siteStyles.container} blog-breadcrumbs`}
        aria-label="Breadcrumb"
      >
        <ol>
          {items.map((item, index) => {
            const isCurrentPage = index === items.length - 1;

            return (
              <li key={item.path}>
                {index > 0 && <span aria-hidden="true">/</span>}
                {isCurrentPage ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <Link href={item.path}>{item.name}</Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
