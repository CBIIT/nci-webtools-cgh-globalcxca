import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";
import Table from "react-bootstrap/Table";

export default function About() {
  return (
    <div className="bg-light py-4">
      <Container>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Low Value</th>
              <th>High Value</th>
              <th>Default Value</th>
              <th>Justification</th>
              <th>Sources</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Prevalence of CIN2/3 in population for cervical screening</td>
              <td>0%</td>
              <td>100%</td>
              <td>2%</td>
              <td>
                Population-based prevalence studies suggest 1-3% prevalence,
                depending upon previous screening history and immunocompetency
                challenges in the population.
              </td>
              <td>
                <p>
                  Zhao FH, Lewkowitz AK, Hu SY, Chen F, Li LY, Zhang QM, Wu RF,
                  Li CQ, Wei LH, Xu AD, Zhang WH, Pan QJ, Zhang X, Belinson JL,
                  Sellors JW, Smith JS, Qiao YL, Franceschi S. Prevalence of
                  human papillomavirus and cervical intraepithelial neoplasia in
                  China: a pooled analysis of 17 population-based studies. Int J
                  Cancer. 2012 Dec 15;131(12):2929-38. doi: 10.1002/ijc.27571.
                  Epub 2012 Apr 24. PMID: 22488743; PMCID: PMC3435460.
                </p>
                <p>
                  Ting J, Kruzikas DT, Smith JS. A global review of age-specific
                  and overall prevalence of cervical lesions. Int J Gynecol
                  Cancer. 2010 Oct;20(7):1244-9. doi:
                  10.1111/igc.0b013e3181f16c5f. PMID: 21495248.
                </p>
                <p>
                  Vesco KK et al. Screening for Cervical Cancer: A Systematic
                  Evidence Review for the U.S. Preventive Services Task Force
                  [Internet]. Rockville (MD): Agency for Healthcare Research and
                  Quality (US); 2011 May. Report No.: 11-05156-EF-1. PMID:
                  22132428.
                </p>
                <p>
                  Web Annex A. Syntheses of evidence. In: WHO guideline for
                  screening and treatment of cervical pre-cancer lesions for
                  cervical cancer prevention, second edition. Geneva: World
                  Health Organization; 2021. Licence: CC BY-NC-SA 3.0 IGO.
                </p>
              </td>
            </tr>
            <tr>
              <td>Interval of cervical screening in years</td>
              <td>1</td>
              <td>40</td>
              <td>5</td>
              <td>
                Cervical cancer screening guidelines do not recommend screening
                more frequently than every 3 years. Typically screening
                intervals range from every 3 or 5 years to every 10 years,
                depending upon test sensitivity and program success with
                completion of follow-up. When considering a once-in-a-lifetime
                screening approach, enter the value 40 and a twice-in-a-lifetime
                approach should enter the value 20.
              </td>
              <td>
                Web Annex A. Syntheses of evidence. In: WHO guideline for
                screening and treatment of cervical pre-cancer lesions for
                cervical cancer prevention, second edition. Geneva: World Health
                Organization;2021. Licence: CC BY-NC-SA 3.0 IGO.
              </td>
            </tr>
            <tr>
              <td>Percent screening coverage</td>
              <td>0%</td>
              <td>100%</td>
              <td>None</td>
              <td>
                This metric refers to the percent of the population that you aim
                to reach over the course of their lifetime. Screening coverage
                varies widely by country, geographic region, resource setting,
                and population.
              </td>
              <td>
                Bruni L, Serrano B, Roura E, Alemany L, Cowan M, Herrero R,
                Poljak M, Murillo R, Broutet N, Riley LM, de Sanjose S. Cervical
                cancer screening programmes and age-specific coverage estimates
                for 202 countries and territories worldwide: a review and
                synthetic analysis. Lancet Glob Health. 2022
                Aug;10(8):e1115-e1127. doi: 10.1016/S2214-109X(22)00241-8. PMID:
                35839811; PMCID: PMC9296658.
              </td>
            </tr>
            <tr>
              <td>Percent of screen positives with triage/diagnostic test</td>
              <td>0%</td>
              <td>100%</td>
              <td>None</td>
              <td>
                This metric refers to the percent of those with an abnormal
                result that will receive the subsequent triage or diagnostic
                test. Follow-up rates vary widely between 25-99%, depending on
                resources and contexts.
              </td>
              <td>
                Murillo, R., et al., Cervical cancer screening programs in Latin
                America and the Caribbean. Vaccine, 2008. 26 Suppl 11: p.
                L37-48.
              </td>
            </tr>
            <tr>
              <td>Percent of triage/diagnostic test positives treated</td>
              <td>0%</td>
              <td>100%</td>
              <td>None</td>
              <td>
                This metric refers to the percent of those with an abnormal
                result that will receive treatment. Follow-up rates vary widely
                between 25-99%, depending on resources and contexts.
              </td>
              <td>
                Murillo, R., et al., Cervical cancer screening programs in Latin
                America and the Caribbean. Vaccine, 2008. 26 Suppl 11: p.
                L37-48.
              </td>
            </tr>
            <tr>
              <td>Percent of screen positives with triage test</td>
              <td>0%</td>
              <td>100%</td>
              <td>None</td>
              <td>
                This metric refers to the percent of those with an abnormal
                result that will receive the triage/diagnostic test. Follow-up
                rates vary widely between 25-99%, depending on resources and
                contexts.
              </td>
              <td>
                Murillo, R., et al., Cervical cancer screening programs in Latin
                America and the Caribbean. Vaccine, 2008. 26 Suppl 11: p.
                L37-48.
              </td>
            </tr>
            <tr>
              <td>Percent of screen positives with diagnostic test</td>
              <td>0%</td>
              <td>100%</td>
              <td>None</td>
              <td>
                This metric refers to the percent of those with an abnormal
                result that will receive the triage/diagnostic test. Follow-up
                rates vary widely between 25-99%, depending on resources and
                contexts.
              </td>
              <td>
                Murillo, R., et al., Cervical cancer screening programs in Latin
                America and the Caribbean. Vaccine, 2008. 26 Suppl 11: p.
                L37-48.
              </td>
            </tr>
            <tr>
              <td>Percent of diagnostic test positives treated</td>
              <td>0%</td>
              <td>100%</td>
              <td>None</td>
              <td>
                This metric refers to the percent of those with an abnormal
                result that will receive treatment. Follow-up rates vary widely
                between 25-99%, depending on resources and contexts.
              </td>
              <td>
                Murillo, R., et al., Cervical cancer screening programs in Latin
                America and the Caribbean. Vaccine, 2008. 26 Suppl 11: p.
                L37-48.
              </td>
            </tr>
          </tbody>
        </Table>
      </Container>
    </div>
  );
}
