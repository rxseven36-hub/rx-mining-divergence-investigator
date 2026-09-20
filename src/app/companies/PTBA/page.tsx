import { CompanyProfilePage } from "@/components/rxmdi/CompanyProfilePage";
import { companyProfiles } from "@/lib/rxmdi-company-profiles";

export default function PTBACompanyPage() {
  return <CompanyProfilePage company={companyProfiles.PTBA} />;
}
