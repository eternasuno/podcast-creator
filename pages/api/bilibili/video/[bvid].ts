import { NextResponse, type NextRequest } from "next/server";

export const config = {
    runtime: "edge",
};

const get = async (url: string) => {
    const response = await fetch(url, {
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15",
        },
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const { code, message, data } = (await response.json()) as any;
    if (code !== 0) {
        throw new Error(message);
    }

    return data;
};

const getInfo = async (bvid: string) => {
    const url = new URL("https://api.bilibili.com/x/web-interface/view");
    url.searchParams.append("bvid", bvid);

    return await get(url.toString());
};

const getVideoPath = async (bvid: string, cid: string) => {
    const url = new URL("https://api.bilibili.com/x/player/playurl");
    url.searchParams.append("bvid", bvid);
    url.searchParams.append("cid", cid);
    url.searchParams.append("fnval", "16");

    const {
        dash: { audio },
    } = await get(url.toString());

    return audio[0].baseUrl as string;
};

const handle = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const bvid = searchParams.get("bvid")!;

    try {
        const { cid } = await getInfo(bvid);
        const path = await getVideoPath(bvid, cid);

        const headers = new Headers();
        headers.set("referer", "https://www.bilibili.com");
        request.headers.has("range") &&
            headers.set("range", request.headers.get("range")!);

        const response = await fetch(path, { headers });

        const contentLength = response.headers.has("content-length")
            ? parseInt(response.headers.get("content-length")!)
            : 0;
        response.headers.set("connection", "keep-alive");
        response.headers.set("keep-alive", "timeout=5, max=1000");
        response.headers.set("content-type", "audio/mp3");
        headers.set(
            "content-range",
            `bytes 0-${contentLength}/${contentLength + 1}`,
        );

        return response;
    } catch (error: any) {
        const message = error.message;
        return new NextResponse(JSON.stringify({ message }), {
            status: 500,
            statusText: "Internal Server Error",
        });
    }
};

export default handle;
