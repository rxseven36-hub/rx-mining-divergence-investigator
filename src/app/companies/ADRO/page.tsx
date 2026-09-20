import { CompanyProfilePage } from "@/components/rxmdi/CompanyProfilePage";
import { companyProfiles } from "@/lib/rxmdi-company-profiles";

export default function ADROCompanyPage() {
  return <CompanyProfilePage company={companyProfiles.ADRO} />;
}
