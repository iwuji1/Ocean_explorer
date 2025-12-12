
import UserIcon from "/user.svg"

export default function FunderAvatarStack({ profiles, maxShown = 5 }) {
    const shown = profiles.slice(0, maxShown);
    const hiddenCount = profiles.length - maxShown.length;

    return (
    <div className="avatar-stack">
      {shown.map((profile) => {
        const name = profile.full_name || "Anonymous";
        const avatarSrc = profile.avatar_url || UserIcon;
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase();

        return (
          <div
            key={profile.id}
            className="avatar-stack-item"
            title={name}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={name} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        );
      })}

      {hiddenCount > 0 && (
        <div className="avatar-stack-item avatar-stack-more" title="More funders">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
}