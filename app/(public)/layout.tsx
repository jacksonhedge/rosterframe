import { LayoutWithBanners } from '../components/ui/LayoutWithBanners';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWithBanners>
      {children}
    </LayoutWithBanners>
  );
}