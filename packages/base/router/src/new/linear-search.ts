import { AdapterRequestContext } from "@hattip/core";

/* eslint-disable @typescript-eslint/ban-types */
type Handler<Ctx, Res> = (ctx: Ctx) => Res | Promise<Res>;

abstract class RouterBase<Ctx, Res, Self> {
	abstract addRoute<Path extends string>(
		path: Path,
		method: string,
		handler: Handler<
			Merge<Ctx, { params: Simplify<RouteParameters<Path>> }>,
			Res
		>,
	): Self;

	get = this._routerMethod.bind(this, "GET");
	post = this._routerMethod.bind(this, "POST");
	put = this._routerMethod.bind(this, "PUT");
	patch = this._routerMethod.bind(this, "PATCH");
	delete = this._routerMethod.bind(this, "DELETE");
	head = this._routerMethod.bind(this, "HEAD");
	options = this._routerMethod.bind(this, "OPTIONS");
	all = this._routerMethod.bind(this, "*");

	use(middleware: (next: Handler<Ctx, Res>) => Handler<Ctx, Res>): Self {
		this._simpleMiddlewares.push(middleware);
		return this as any;
	}

	with<Decoration = {}>(
		middleware: (
			next: Handler<Merge<Ctx, Decoration>, Res>,
		) => Handler<Ctx, Res>,
	): RouteGroup<Merge<Ctx, Decoration>, Res> {
		return new RouteGroup(this, middleware as any);
	}

	private _routerMethod<Path extends string>(
		method: string,
		path: Path,
		handler: Handler<
			Merge<Ctx, { params: Simplify<RouteParameters<Path>> }>,
			Res
		>,
	): Self {
		this.addRoute(path, method, handler);
		return this as any;
	}

	protected _simpleMiddlewares: Array<
		(handler: Handler<any, any>) => Handler<any, any>
	> = [];
}

class RouteGroup<Ctx, Res> extends RouterBase<Ctx, Res, RouteGroup<Ctx, Res>> {
	constructor(
		parent: RouterBase<any, any, any>,
		middleware?: (next: any) => any,
	) {
		super();
		this._parent = parent;
		this._simpleMiddlewares = middleware ? [middleware] : [];
	}

	addRoute<Path extends string>(
		path: Path,
		method: string,
		handler: Handler<
			Merge<Ctx, { params: Simplify<RouteParameters<Path>> }>,
			Res
		>,
	) {
		const composed = this._simpleMiddlewares.reduceRight(
			(prev, curr) => curr(prev),
			handler,
		);
		this._parent.addRoute(path, method, composed as any);
		return this;
	}

	private _parent: RouterBase<any, any, any>;
}

interface RouterContext<Plaform> extends AdapterRequestContext<Plaform> {
	url: URL;
	method: string;
	params: any;
}

export class Router<Platform = unknown> extends RouterBase<
	RouterContext<Platform>,
	Response,
	Router<Platform>
> {
	addRoute<Path extends string>(
		path: Path,
		method: string,
		handler: Handler<
			RouterContext<Platform> & { params: Simplify<RouteParameters<Path>> },
			Response
		>,
	) {
		const composed = this._simpleMiddlewares.reduceRight(
			(prev, curr) => curr(prev),
			handler,
		);
		this._routes.push([pathToRegExp(path), { [method]: composed }]);
		return this;
	}

	async handler(ctx: AdapterRequestContext<Platform>): Promise<Response> {
		const url = new URL(ctx.request.url);
		const method = ctx.request.method;
		const path = url.pathname;

		for (const [route, handlers] of this._routes) {
			const match = route.exec(path);

			if (match) {
				const params: Record<string, string> = match.groups ?? {};
				const handler = handlers[method] ?? handlers["*"];
				if (handler) {
					return handler({ ...ctx, url, method, params });
				}
			}
		}

		return new Response("Not found", { status: 404 });
	}

	private _routes: [
		RegExp,
		Record<string, Handler<RouterContext<Platform>, Response> | undefined>,
	][] = [];
}

export interface RouteMatch<Handler> {
	params: Record<string, string>;
	handler: Handler;
}

function pathToRegExp(path: string) {
	// Adapted from: https://github.com/kwhitley/itty-router/blob/73148972bf2e205a4969e85672e1c0bfbf249c27/src/itty-router.js#L7
	return RegExp(
		`^${path
			.replace(/\/$/, "")
			.replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3")
			.replace(/\.(?=[\w(])/, "\\.")
			.replace(/\)\.\?\(([^[]+)\[\^/g, "?)\\.?($1(?<=\\.)[^\\.")}/?$`
			.replace(/(\/?)\*([a-zA-Z_][a-zA-Z0-9_-]*)/g, "(?:$1(?<$2>.*))?")
			.replace(/(\/?)\*/g, "(?:$1.*)?"),
	);
}

type ParamsDictionary = Record<string, string | undefined>;

type RemoveTail<
	S extends string,
	Tail extends string,
> = S extends `${infer P}${Tail}` ? P : S;

type GetRouteParameter<S extends string> = RemoveTail<
	RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
	`.${string}`
>;

type RouteParameters<Route extends string> = string extends Route
	? ParamsDictionary
	: Route extends `${string}:${infer Rest}`
	? (GetRouteParameter<Rest> extends never
			? ParamsDictionary
			: GetRouteParameter<Rest> extends `${infer ParamName}?`
			? { [P in ParamName]?: string }
			: { [P in GetRouteParameter<Rest>]: string }) &
			(Rest extends `${GetRouteParameter<Rest>}${infer Next}`
				? RouteParameters<Next>
				: unknown)
	: Route extends `${string}*${infer Rest}`
	? { [P in Rest]: string }
	: {};

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type Merge<B, O> = Simplify<Omit<B, keyof O> & O>;

export type Decorator<Ctx, Dec, Res> = (
	next: Handler<Merge<Ctx, Dec>, Res>,
) => Handler<Ctx, Res>;

////////////////////////

const r = new Router<{ x: string }>();

interface QueryParserContext {
	url: {
		search: string;
		searchParams?: URLSearchParams;
	};
}

function createQueryParser<Ctx extends QueryParserContext, Res>() {
	return function queryParser(
		handler: Handler<Merge<Ctx, { query: Record<string, string> }>, Res>,
	): Handler<Ctx, Res> {
		return (ctx) => {
			const searchParams =
				ctx.url.searchParams ?? new URLSearchParams(ctx.url.search);
			const query = Object.fromEntries(searchParams.entries());
			return handler({ ...ctx, query });
		};
	};
}

interface CookieParserContext {
	request: { headers: { get(name: "cookie"): string | null } };
}

function createCookieParser<
	Ctx extends CookieParserContext,
	Res,
	Key extends string,
>(key: Key): Decorator<Ctx, { [K in Key]: Record<string, string> }, Res> {
	return function cookieParser(
		handler: Handler<Merge<Ctx, { [K in Key]: Record<string, string> }>, Res>,
	): Handler<Ctx, Res> {
		return (ctx) => {
			const cookie = parseCookie(ctx.request.headers.get("cookie") ?? "");
			return handler({ ...ctx, [key]: cookie } as any);
		};
	};
}

function parseCookie(cookie: string): Record<string, string> {
	void cookie;
	throw new Error("Not implemented");
}

const withQuery = r
	.with(createCookieParser("coo"))
	.with(createQueryParser())
	.with((next) => (ctx) => {
		if (!ctx.request.headers.has("x")) {
			return new Response("No x header", { status: 400 });
		}

		return next(ctx);
	});

withQuery.get("/", (ctx) => {
	ctx.coo;
	return new Response(ctx.query.x);
});
