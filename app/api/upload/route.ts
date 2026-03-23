import { auth } from "@/lib/auth";
import { r2, R2_BUCKET, R2_PUBLIC_URL } from "@/lib/r2";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contentType = searchParams.get("contentType") ?? "";

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Tipo de arquivo não permitido." },
      { status: 400 },
    );
  }

  const contentLengthParam = searchParams.get("contentLength");
  const contentLength = parseInt(contentLengthParam ?? "", 10);
  if (
    !contentLengthParam ||
    isNaN(contentLength) ||
    contentLength < 1 ||
    contentLength > MAX_FILE_SIZE
  ) {
    return NextResponse.json(
      { error: "Tamanho do arquivo excede o limite de 5MB." },
      { status: 400 },
    );
  }

  const ext = contentType.split("/")[1];
  const key = `grupos/${randomUUID()}.${ext}`;

  const { url, fields } = await createPresignedPost(r2, {
    Bucket: R2_BUCKET,
    Key: key,
    Conditions: [
      ["content-length-range", 1, MAX_FILE_SIZE],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: {
      "Content-Type": contentType,
    },
    Expires: 300,
  });

  return NextResponse.json({
    url,
    fields,
    publicUrl: `${R2_PUBLIC_URL}/${key}`,
  });
}
