import { ThemeIcon } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { CircleIcon, XIcon } from "@/shared/icons";

export interface GameBoardCellProps {
	disabled: boolean;
	isValidMove: boolean;
	onClickCell: () => void;
	value: "empty" | "p1" | "p2";
}

export function GameBoardCell({
	disabled,
	isValidMove,
	onClickCell,
	value,
}: GameBoardCellProps) {
	// Match card height with available width, to create square
	const ref = useRef<HTMLButtonElement>(null);
	const [offsetWidth, setOffsetWidth] = useState(0);
	useEffect(() => {
		const onResize = () => {
			if (ref.current) {
				setOffsetWidth(ref.current.offsetWidth);
			}
		};

		onResize();
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);

	return (
		<button
			disabled={disabled}
			onClick={onClickCell}
			ref={ref}
			style={{
				border: `2px solid ${isValidMove ? "var(--mantine-color-green-5)" : ""}`,
				borderRadius: "var(--mantine-radius-default)",
				cursor: isValidMove ? "pointer" : "",
				width: "100%",
				height: offsetWidth,
				padding: 0,
				margin: 0,
			}}
			type="button"
		>
			{value !== "empty" ? (
				<ThemeIcon
					style={{ width: "100%", height: "100%" }}
					color={value === "p1" ? "blue" : "red"}
					variant="light"
				>
					{value === "p1" ? <XIcon /> : <CircleIcon />}
				</ThemeIcon>
			) : null}
		</button>
	);
}
