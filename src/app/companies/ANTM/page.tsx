import { CompanyProfilePage } from "@/components/rxmdi/CompanyProfilePage";
import { companyProfiles } from "@/lib/rxmdi-company-profiles";

export default function ANTMCompanyPage() {
  return <CompanyProfilePage company={companyProfiles.ANTM} />;
}
