import { useState, useCallback } from "react";
import { FileDropzone } from "../components/tools/FileDropzone";
import { ProgressBar } from "../components/tools/ProgressBar";
import { formatBytes } from "../lib/utils/fileValidation";

interface CountResult {
	words: number;
	chars: number;
	charsNoSpaces: number;
	sentences: number;
	paragraphs: number;
	pages: number;
}

export default function WordCountPDF() {
	const [file, setFile] = useState<File | null>(null);
	const [processing, setProcessing] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<CountResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFiles = useCallback((files: File[]) => {
		if (files.length > 0) {
			setFile(files[0]!);
			setResult(null);
			setError(null);
		}
	}, []);

	const handleCount = async () => {
		if (!file) return;
		setProcessing(true);
		setProgress(0);
		setError(null);

		try {
			const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
			GlobalWorkerOptions.workerSrc =
				"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.5.207/pdf.worker.min.mjs";

			const bytes = new Uint8Array(await file.arrayBuffer());
			const pdf = await getDocument({ data: bytes }).promise;
			const totalPages = pdf.numPages;
			let fullText = "";

			for (let i = 1; i <= totalPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				const pageText = content.items
					.map((item) => ("str" in item ? item.str : ""))
					.join(" ");
				fullText += pageText + "\n";
				setProgress(Math.round((i / totalPages) * 100));
			}

			const words = fullText
				.trim()
				.split(/\s+/)
				.filter((w) => w.length > 0).length;
			const chars = fullText.length;
			const charsNoSpaces = fullText.replace(/\s/g, "").length;
			const sentences = (fullText.match(/[.!?]+/g) ?? []).length;
			const paragraphs = fullText
				.split(/\n{2,}/)
				.filter((p) => p.trim().length > 0).length;

			setResult({ words, chars, charsNoSpaces, sentences, paragraphs, pages: totalPages });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to extract text from PDF");
		} finally {
			setProcessing(false);
		}
	};

	const stat = (label: string, value: number) => (
		<div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
			<p className="text-3xl font-bold text-blue-600">{value.toLocaleString()}</p>
			<p className="text-sm text-gray-500 mt-1">{label}</p>
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
							onClick={() => { setFile(null); setResult(null); }}
							className="text-sm text-blue-600 hover:text-blue-700"
						>
							Change
						</button>
					</div>

					{processing && <ProgressBar progress={progress} label="Extracting text..." />}

					{error && (
						<div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
							{error}
						</div>
					)}

					{result ? (
						<>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
								{stat("Words", result.words)}
								{stat("Characters", result.chars)}
								{stat("Chars (no spaces)", result.charsNoSpaces)}
								{stat("Sentences", result.sentences)}
								{stat("Paragraphs", result.paragraphs)}
								{stat("Pages", result.pages)}
							</div>
							<button
								type="button"
								onClick={() => { setFile(null); setResult(null); }}
								className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
							>
								Analyse Another
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={handleCount}
							disabled={processing}
							className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm"
						>
							{processing ? "Counting..." : "Count Words"}
						</button>
					)}
				</>
			)}
		</div>
	);
}
