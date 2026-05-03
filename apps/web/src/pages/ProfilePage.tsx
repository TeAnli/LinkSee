import { PagePlaceholder } from '../components/layout/PagePlaceholder';

export function ProfilePage() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[760px] flex flex-col gap-4">
        <PagePlaceholder
          label="Profile Card"
          icon="mdi:account-circle-outline"
        />
        <PagePlaceholder
          label="Settings List"
          icon="mdi:cog-outline"
        />
      </div>
    </div>
  );
}
