import { Size } from '@/types/houseComponent';

type Props = { componentSize: Size; precision?: number };
export const formatComponentSize = ({
  componentSize,
  precision = 2,
}: Props): JSX.Element => {
  const formattedWidth = parseFloat(componentSize.width.toString()).toFixed(
    precision,
  );
  const formattedHeight = parseFloat(componentSize.height.toString()).toFixed(
    precision,
  );

  return (
    <>
      {formattedWidth} x {formattedHeight} m<sup>2</sup>
    </>
  );
};
