import { CompanyProfilePage } from "@/components/rxmdi/CompanyProfilePage";
import { companyProfiles } from "@/lib/rxmdi-company-profiles";

export default function AADICompanyPage() {
  return <CompanyProfilePage company={companyProfiles.AADI} />;
}
