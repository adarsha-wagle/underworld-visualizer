import BubbleStream from "./bubble-stream";

function Bubbles() {
  return (
    <>
      <BubbleStream position={[-30, -20, 10]} count={40} />
      <BubbleStream position={[15, -22, -25]} count={30} />
      <BubbleStream position={[0, -25, 0]} count={60} />
    </>
  );
}

export default Bubbles;
