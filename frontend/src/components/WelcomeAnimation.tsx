import { useEffect, useState } from "react";

export default function WelcomeAnimation() {
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const fadeInTimer = window.setTimeout(() => {
      setVisible(true);
    }, 100);

    const fadeOutTimer = window.setTimeout(() => {
      setVisible(false);
    }, 2200);

    const removeTimer = window.setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => {
      window.clearTimeout(fadeInTimer);
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#080b0f] transition-opacity duration-700 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="px-6 text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-4xl">
          🔥
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.3em] text-red-500">
          Wildfire Intelligence
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Situational awareness,
          <br />
          powered by AI.
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Intelligence for wildfire management.
        </p>

      </div>
    </div>
  );
}