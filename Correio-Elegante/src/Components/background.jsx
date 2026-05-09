import { useEffect, useState } from "react";

export default function Background() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.random().toString(36).substr(2, 9);

      const newHeart = {
        id,
        left: Math.random() * 100,
        size: 12 + Math.random() * 20,
        duration: 3 + Math.random() * 3,
      };

      setHearts((prev) => [...prev, newHeart]);

      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, 6000);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="background">
      {/* BINÁRIO */}
      <div className="binary" />

      {/* CORAÇÕES */}
      <div className="hearts">
        {hearts.map((h) => (
          <span
            key={h.id}
            className="heart"
            style={{
              left: `${h.left}vw`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.duration}s`,
            }}
          >
            ❤
          </span>
        ))}
      </div>
    </div>
  );
}