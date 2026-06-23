import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { DownloadButton } from "../components/tools/DownloadButton";
import { ProgressBar } from "../components/tools/ProgressBar";
import { downloadBytes } from "../lib/utils/downloadBlob";
import { formatBytes } from "../lib/utils/fileValidation";

interface PDFMetadata {
	title: string;
	author: string;
	subject: string;
	keywords: string;
	creator: string;
	producer: string;
}

export default function MetadataPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [meta, setMeta] = useState<PDFMetadata>({
		title: "",
		author: "",
		subject: "",
		keywords: "",
		creator: "",
		producer: "",
	});
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<Uint8Array | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loaded, setLoaded] = useState(false);

	const handleFiles = useCallback(async (files: File[]) => {
		if (files.length === 0) return;
		const f = files[0]!;
		setFile(f);
		setResult(null);
		setError(null);
		setLoaded(false);

		// Read existing metadata
		try {
			const { PDFDocument } = await import("pdf-lib");
			const bytes = new Uint8Array(await f.arrayBuffer());
			const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
			setMeta({
				title: pdf.getTitle() ?? "",
				author: pdf.getAuthor() ?? "",
				subject: pdf.getSubject() ?? "",
				keywords: pdf.getKeywords() ?? "",
				creator: pdf.getCreator() ?? "",
				producer: pdf.getProducer() ?? "",
			});
			setLoaded(true);
		} catch {
			setMeta({ title: "", author: "", subject: "", keywords: "", creator: "", producer: "" });
			setLoaded(true);
		}
	}, []);

	const handleSave = async () => {
		if (!file) return;
		setProcessing(true);
		setProgress(0);
		setError(null);

		try {
			const interval = setInterval(() => setProgress((p) => Math.min(p + 15, 90)), 100);
			const { PDFDocument } = await import("pdf-lib");
			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdf = await PDFDocument.load(bytes);

			if (meta.title) pdf.setTitle(meta.title);
			if (meta.author) pdf.setAuthor(meta.author);
			if (meta.subject) pdf.setSubject(meta.subject);
			if (meta.keywords) pdf.setKeywords([meta.keywords]);
			if (meta.creator) pdf.setCreator(meta.creator);
			if (meta.producer) pdf.setProducer(meta.producer);
			pdf.setModificationDate(new Date());

			clearInterval(interval);
			setProgress(100);
			setResult(await pdf.save());
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update metadata");
		} finally {
			setProcessing(false);
		}
	};

	const field = (
		label: string,
		key: keyof PDFMetadata,
		placeholder?: string,
	) => (
		<div>
			<label className="block text-sm font-medium text-gray-700 mb-1">
				{label}
			</label>
			<input
				type="text"
				value={meta[key]}
				onChange={(e) => setMeta((m) => ({ ...m, [key]: e.target.value }))}
				placeholder={placeholder ?? label}
				className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>
	);

	return (
		<div className="space-y-6">
			{!file ? (
				<FileDropzone
					accept={[".pdf"]}
					onFiles={handleFiles}
					title="Drop your PDF here"
					subtitle="or click to browse"
				/>
			) : (
				<>
					<div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
							<p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
						</div>
						<button
							type="button"
							onClick={() => { setFile(null); setResult(null); setLoaded(false); }}
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Change
						</button>
					</div>

					{loaded && (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{field("Title", "title", "Document title")}
							{field("Author", "author", "Author name")}
							{field("Subject", "subject", "Document subject")}
							{field("Keywords", "keywords", "keyword1, keyword2")}
							{field("Creator", "creator", "Application that created the PDF")}
							{field("Producer", "producer", "PDF producer")}
						</div>
					)}

					{processing && <ProgressBar progress={progress} label="Saving metadata..." />}

					{error && (
						<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
							{error}
						</div>
					)}

					<div className="flex flex-wrap items-center gap-3">
						{!result ? (
							<button
								type="button"
								onClick={handleSave}
								disabled={!loaded || processing}
								className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
							>
								{processing ? "Saving..." : "Save Metadata"}
							</button>
						) : (
							<DownloadButton
								filename={`${file.name.replace(/\.pdf$/i, "")}-metadata.pdf`}
								onClick={() => result && downloadBytes(result, `${file.name.replace(/\.pdf$/i, "")}-metadata.pdf`)}
								label="Download Updated PDF"
							/>
						)}
						{result && (
							<button
								type="button"
								onClick={() => { setFile(null); setResult(null); setLoaded(false); }}
								className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
							>
								Start Over
							</button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
