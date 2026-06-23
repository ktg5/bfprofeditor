import { BFPROF, type ProfSetting } from './BFPROF';


let currentProf: BFPROF | null = null;
let currentSettings: ProfSetting[] | null = null;


const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;


fileInput.addEventListener('change', async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;
    const file = target.files[0];

    try {
        const arrayBuffer = await file.arrayBuffer();
        const rawData = new Uint8Array(arrayBuffer);

        currentProf = new BFPROF(rawData);
        currentSettings = currentProf.parse();

        console.log(`parsed ${currentSettings.length} settings!`);
        console.log(currentSettings);

        // Temp
        saveBtn.disabled = false;


        // TODO: Make script/function for turning settings into UI stuff xdd

    } catch (error) {
        console.error("Error reading or parsing the PROFSAVE file:", error);
        alert("Failed to parse file. Make sure it's a valid PROFSAVE.");
    }
});


saveBtn.addEventListener('click', () => {
    if (!currentProf) return;

    const modifiedData: Uint8Array = currentProf.serialize();
    const blob = new Blob([modifiedData as BlobPart], { type: "application/octet-stream" });

    // Create a temporary, invisible link to trigger the download natively
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "PROFSAVE";
    
    // Append, click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});
