import { syncAllDriveEvents } from "./src/lib/drive/drive.service";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

syncAllDriveEvents().then(report => {
  console.log(JSON.stringify(report, null, 2));
}).catch(console.error);
