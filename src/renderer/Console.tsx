import { Dispatch, SetStateAction, useRef, useEffect } from 'react';

interface Props {
  logger: string[];
  setLogger: Dispatch<SetStateAction<string[]>>;
}

const Console: React.FC<Props> = ({
  logger,
  setLogger,
}: {
  logger: string[];
  setLogger: Dispatch<SetStateAction<string[]>>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current?.scrollHeight;
  }, [logger]);

  return (
    <div className="Console m-5 p-2 rounded-xl overflow-x-hidden flex flex-col justify-between">
      <div ref={ref} className=" overflow-y-scroll ">
        {logger.map((line: string, i: number) => (
          <div className="flex">
            <code className="text-gray-700 text-xs whitespace-nowrap">
              {`${i}-`}
            </code>
            <code className="text-gray-700 text-xs">&nbsp;{`${line}`}</code>
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          className="bg-[#1FC7D4] rounded-md p-2 "
          onClick={() => {
            setLogger([]);
          }}
        >
          Clear logs
        </button>
      </div>
    </div>
  );
};

export default Console;

// Importing dialog module using remote
