import {
	Link as RRDLink,
	type LinkProps as RRDLinkProps,
} from "react-router-dom";

export function Link(props: RRDLinkProps) {
	return <RRDLink {...props} />;
}
