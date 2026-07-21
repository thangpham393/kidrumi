import Image from "next/image";

/* Full-viewport clay landscape rendered behind all content.
   Fixed layer, anchored to the bottom so the hills/props stay grounded. */

export default function SceneBackground() {
  return (
    <div className="scene" aria-hidden="true">
      <Image
        src="/illustrations/background.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="scene-img"
      />
      <div className="scene-veil" />
    </div>
  );
}
